import type { NewsCategory, NewsFeed, NewsItem, NewsTopic } from '#shared/types/news'

interface HNHit {
  objectID: string
  title: string | null
  url: string | null
  points: number | null
  num_comments: number | null
  created_at: string
}

interface DevToArticle {
  id: number
  title: string
  url: string
  description: string | null
  published_at: string
  positive_reactions_count: number
  comments_count: number
}

const FETCH_OPTIONS = { timeout: 8000, retry: 1 } as const

interface HackerNewsSource {
  category: NewsCategory
  topic?: NewsTopic
  /** Busca por query relevante; sem query, usa a front page curada. */
  query?: string
}

async function fetchHackerNews({ category, topic, query }: HackerNewsSource): Promise<NewsItem[]> {
  // Sem query: front page (curadoria da comunidade).
  // Com query: busca recente por relevância com corte de pontos p/ reduzir ruído.
  const endpoint = query
    ? `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${encodeURIComponent(query)}&hitsPerPage=20&numericFilters=points>2`
    : 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20'

  const { hits } = await $fetch<{ hits: HNHit[] }>(endpoint, FETCH_OPTIONS)

  return hits
    .filter(hit => hit.title)
    .map(hit => ({
      id: `hn-${hit.objectID}`,
      title: hit.title!,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      source: 'Hacker News',
      sourceIcon: 'i-simple-icons-ycombinator',
      category,
      topic,
      publishedAt: hit.created_at,
      points: hit.points ?? 0,
      comments: hit.num_comments ?? 0
    }))
}

async function fetchDevTo(tag: string, category: NewsCategory, topic?: NewsTopic): Promise<NewsItem[]> {
  const articles = await $fetch<DevToArticle[]>('https://dev.to/api/articles', {
    ...FETCH_OPTIONS,
    params: { tag, per_page: 15 }
  })

  return articles.map(article => ({
    id: `devto-${article.id}`,
    title: article.title,
    url: article.url,
    source: 'DEV Community',
    sourceIcon: 'i-simple-icons-devdotto',
    category,
    topic,
    publishedAt: article.published_at,
    points: article.positive_reactions_count ?? 0,
    comments: article.comments_count ?? 0,
    description: article.description
  }))
}

export default defineCachedEventHandler(async (): Promise<NewsFeed> => {
  // Cada item carrega a fonte real da API que o devolveu (HN ou DEV).
  // Categoria vem da busca/tag — não forçamos fonte ↔ categoria.
  const results = await Promise.allSettled([
    // Tecnologia (HN + DEV)
    fetchHackerNews({ category: 'tecnologia' }),
    fetchDevTo('technology', 'tecnologia'),
    // Cibersegurança (HN + DEV)
    fetchHackerNews({ category: 'ciberseguranca', query: 'security' }),
    fetchDevTo('cybersecurity', 'ciberseguranca'),
    // Subtema IA (dentro de tecnologia)
    fetchHackerNews({ category: 'tecnologia', topic: 'ia', query: 'AI' }),
    fetchDevTo('ai', 'tecnologia', 'ia'),
    fetchDevTo('machinelearning', 'tecnologia', 'ia'),
    // Subtema UI/UX (dentro de tecnologia)
    fetchHackerNews({ category: 'tecnologia', topic: 'uiux', query: 'UI UX design' }),
    fetchDevTo('ux', 'tecnologia', 'uiux'),
    fetchDevTo('design', 'tecnologia', 'uiux')
  ])

  const items = results.flatMap(result => result.status === 'fulfilled' ? result.value : [])

  if (!items.length) {
    throw createError({ statusCode: 502, statusMessage: 'Nenhuma fonte de notícias respondeu' })
  }

  // Dedup por URL: se a mesma matéria veio de mais de uma busca,
  // preferimos a versão com subtema (IA / UI-UX) e mais engajamento.
  const byUrl = new Map<string, NewsItem>()
  for (const item of items) {
    const key = item.url.replace(/\/+$/, '')
    const existing = byUrl.get(key)
    if (!existing) {
      byUrl.set(key, item)
      continue
    }
    const score = (candidate: NewsItem) => (candidate.topic ? 1000 : 0) + candidate.points + candidate.comments
    if (score(item) > score(existing)) {
      byUrl.set(key, item)
    }
  }

  const deduped = [...byUrl.values()]
  deduped.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))

  // Intercala as fontes para o volume maior do DEV não expulsar o HN
  // quando aplicamos o limite final do feed.
  const hackerNews = deduped.filter(item => item.source === 'Hacker News')
  const devCommunity = deduped.filter(item => item.source === 'DEV Community')
  const balanced: NewsItem[] = []
  const maxItems = 72
  for (let index = 0; balanced.length < maxItems; index++) {
    const hackerNewsItem = hackerNews[index]
    const devCommunityItem = devCommunity[index]
    if (!hackerNewsItem && !devCommunityItem) break
    if (hackerNewsItem) balanced.push(hackerNewsItem)
    if (devCommunityItem && balanced.length < maxItems) balanced.push(devCommunityItem)
  }

  return {
    updatedAt: new Date().toISOString(),
    items: balanced
  }
}, {
  name: 'live-news',
  getKey: () => 'balanced-v1',
  // Feed "quase real time": cache de 2 min com revalidação em background (SWR).
  maxAge: 120,
  swr: true
})
