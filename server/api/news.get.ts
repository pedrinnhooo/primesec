import { createHash } from 'node:crypto'
import type { NewsCategory, NewsFeed, NewsItem, NewsTopic } from '#shared/types/news'
import { fetchDevTo, fetchHackerNews } from '../utils/news-apis'
import {
  looksLikeCyberNews,
  shouldKeepNews
} from '../utils/news-filter'
import { resolveNewsLang } from '../utils/news-lang'
import {
  allRssSources,
  isGoogleNewsSource,
  type RssSourceConfig
} from '../utils/news-sources'
import { inferNewsTags, inferNewsTopic, matchesTopic } from '../utils/news-topics'
import { translateNewsItems } from '../utils/news-translate'
import { parseRss } from '../utils/rss'

/** Subtemas exclusivos de cibersegurança — não devem ficar em Tecnologia. */
const CYBER_ONLY_TOPICS = new Set<NewsTopic>([
  'redteam',
  'blueteam',
  'purpleteam',
  'lgpd-grc'
])

const FETCH_OPTIONS = {
  timeout: 10_000,
  retry: 1,
  responseType: 'text' as const,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; PrimeSecNewsBot/1.0; +https://primesec.com.br)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*'
  }
}

function itemId(source: string, url: string): string {
  return createHash('sha1').update(`${source}:${url}`).digest('hex').slice(0, 16)
}

function resolveTopic(haystack: string, preferred?: NewsTopic): NewsTopic | undefined {
  const inferred = inferNewsTopic(haystack)
  // Mobile (Flutter/RN/iOS/Android) vence preferred genérico (ex.: frontend do feed).
  if (inferred === 'mobile') return 'mobile'
  if (preferred && preferred !== 'geral' && matchesTopic(haystack, preferred)) {
    return preferred
  }
  return inferred
}

function resolveCategory(
  configCategory: NewsCategory,
  topic: NewsTopic | undefined,
  haystack: string
): NewsCategory {
  if (topic && CYBER_ONLY_TOPICS.has(topic)) return 'ciberseguranca'
  if (configCategory === 'tecnologia' && looksLikeCyberNews(haystack)) {
    return 'ciberseguranca'
  }
  return configCategory
}

/** Tecnologia sem subtema específico → Geral (aparece no filtro). */
function withGeralTopic(item: NewsItem & { balanceKey: string }): NewsItem & { balanceKey: string } {
  if (item.category === 'tecnologia' && !item.topic) {
    return { ...item, topic: 'geral' }
  }
  return item
}

async function fetchRssSource(
  config: RssSourceConfig
): Promise<Array<NewsItem & { balanceKey: string }>> {
  const xml = await $fetch<string>(config.url, FETCH_OPTIONS)
  if (typeof xml !== 'string' || !xml.includes('<item')) {
    throw createError({ statusCode: 502, statusMessage: `Feed inválido: ${config.source}` })
  }

  const parsed = parseRss(xml).slice(0, config.limit ?? 15)

  return parsed.flatMap((entry) => {
    const haystack = [entry.title, entry.description || '', ...entry.categories].join(' ')

    if (!shouldKeepNews(haystack, config.requireRelevance)) {
      return []
    }

    if (
      config.topic
      && config.topic !== 'geral'
      && config.balanceKey === 'google-news'
      && !matchesTopic(haystack, config.topic)
    ) {
      return []
    }

    const topic = resolveTopic(haystack, config.topic)
    const category = resolveCategory(config.category, topic, haystack)
    const sourceName = entry.publisher && isGoogleNewsSource(config.source)
      ? `${entry.publisher} via ${config.source}`
      : config.source

    const tags = topic === 'mobile' ? inferNewsTags(haystack) : undefined

    return [withGeralTopic({
      id: itemId(config.balanceKey, entry.link),
      title: entry.title,
      url: entry.link,
      source: sourceName,
      sourceIcon: config.sourceIcon,
      category,
      topic,
      ...(tags?.length ? { tags } : {}),
      publishedAt: entry.publishedAt,
      points: 0,
      comments: 0,
      description: entry.description,
      balanceKey: config.balanceKey
    })]
  })
}

function engagementLoaders(): Array<() => Promise<NewsItem[]>> {
  return [
    () => fetchHackerNews({
      category: 'tecnologia',
      topic: 'frontend',
      query: 'frontend OR react OR vue OR "next.js" OR css',
      limit: 12
    }),
    () => fetchHackerNews({
      category: 'tecnologia',
      topic: 'backend',
      query: 'backend OR "node.js" OR api OR graphql OR django OR fastapi',
      limit: 12
    }),
    () => fetchHackerNews({
      category: 'tecnologia',
      topic: 'database',
      query: 'database OR postgres OR postgresql OR mysql OR mongodb OR redis OR sql',
      limit: 12
    }),
    () => fetchHackerNews({
      category: 'tecnologia',
      topic: 'mobile',
      query: 'flutter OR dart OR "react native" OR expo OR android OR ios OR swiftui OR "jetpack compose"',
      limit: 14
    }),
    () => fetchDevTo({ tag: 'frontend', category: 'tecnologia', topic: 'frontend', limit: 10 }),
    () => fetchDevTo({ tag: 'react', category: 'tecnologia', topic: 'frontend', limit: 8 }),
    () => fetchDevTo({ tag: 'backend', category: 'tecnologia', topic: 'backend', limit: 10 }),
    () => fetchDevTo({ tag: 'node', category: 'tecnologia', topic: 'backend', limit: 8 }),
    () => fetchDevTo({ tag: 'database', category: 'tecnologia', topic: 'database', limit: 10 }),
    () => fetchDevTo({ tag: 'sql', category: 'tecnologia', topic: 'database', limit: 8 }),
    () => fetchDevTo({ tag: 'postgres', category: 'tecnologia', topic: 'database', limit: 6 }),
    // Mobile — Flutter em destaque; DEV.to tags públicas (sem API key)
    () => fetchDevTo({ tag: 'flutter', category: 'tecnologia', topic: 'mobile', limit: 12 }),
    () => fetchDevTo({ tag: 'dart', category: 'tecnologia', topic: 'mobile', limit: 8 }),
    () => fetchDevTo({ tag: 'reactnative', category: 'tecnologia', topic: 'mobile', limit: 8 }),
    () => fetchDevTo({ tag: 'android', category: 'tecnologia', topic: 'mobile', limit: 8 }),
    () => fetchDevTo({ tag: 'ios', category: 'tecnologia', topic: 'mobile', limit: 8 }),
    () => fetchDevTo({ tag: 'security', category: 'ciberseguranca', topic: 'blueteam', limit: 8 }),
    () => fetchHackerNews({
      category: 'ciberseguranca',
      topic: 'redteam',
      query: 'vulnerability OR exploit OR ransomware OR "security"',
      limit: 10
    })
  ]
}

function withBalanceKey(item: NewsItem, balanceKey: string): NewsItem & { balanceKey: string } {
  return { ...item, balanceKey }
}

/** Intercala itens de várias fontes para nenhuma dominar o feed. */
function interleaveBySource(
  items: Array<NewsItem & { balanceKey: string }>,
  maxItems: number
): NewsItem[] {
  const buckets = new Map<string, Array<NewsItem & { balanceKey: string }>>()
  for (const item of items) {
    const list = buckets.get(item.balanceKey) ?? []
    list.push(item)
    buckets.set(item.balanceKey, list)
  }

  const queues = [...buckets.values()]
  const balanced: NewsItem[] = []
  let index = 0
  while (balanced.length < maxItems) {
    let added = false
    for (const queue of queues) {
      const next = queue[index]
      if (next) {
        const { balanceKey: _, ...item } = next
        balanced.push(item)
        added = true
        if (balanced.length >= maxItems) break
      }
    }
    if (!added) break
    index++
  }
  return balanced
}

export default defineCachedEventHandler(async (event): Promise<NewsFeed> => {
  const query = getQuery(event)
  const lang = resolveNewsLang(query.lang)

  const sources = allRssSources()
  const loaders = engagementLoaders()

  const results = await Promise.allSettled([
    ...sources.map(source => fetchRssSource(source)),
    ...loaders.map(async (load) => {
      const items = await load()
      return items.map(item => withBalanceKey(
        item,
        item.source === 'Hacker News' ? 'hacker-news' : 'devto'
      ))
    })
  ])

  const items = results.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    return []
  })

  if (!items.length) {
    throw createError({ statusCode: 502, statusMessage: 'Nenhuma fonte de notícias respondeu' })
  }

  const byUrl = new Map<string, NewsItem & { balanceKey: string }>()
  for (const item of items) {
    const key = item.url.replace(/\/+$/, '')
    const existing = byUrl.get(key)
    if (!existing) {
      byUrl.set(key, item)
      continue
    }
    const score = (candidate: NewsItem) =>
      (candidate.points + candidate.comments) * 10
      + (candidate.topic && candidate.topic !== 'geral' ? 1000 : 0)
      + (candidate.description ? 50 : 0)
      + (candidate.sourceIcon === 'i-simple-icons-googlenews' ? -200 : 0)
      + candidate.title.length
    if (score(item) > score(existing)) {
      byUrl.set(key, item)
    }
  }

  const deduped = [...byUrl.values()]
  deduped.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))

  const balanced = interleaveBySource(deduped, 90)
  const withTopics = ensureTopicCoverage(balanced, deduped, [
    'redteam',
    'blueteam',
    'purpleteam',
    'lgpd-grc',
    'ia',
    'uiux',
    'frontend',
    'backend',
    'database',
    'mobile'
  ], 90)

  const withEngagement = ensureEngagementCoverage(withTopics, deduped, 90, 14)
  const translated = await translateNewsItems(withEngagement, lang)

  return {
    updatedAt: new Date().toISOString(),
    items: translated
  }
}, {
  name: 'live-news',
  getKey: (event) => {
    const query = getQuery(event)
    return `all-regions-translate-${resolveNewsLang(query.lang)}-v15`
  },
  maxAge: 120,
  swr: false,
  shouldBypassCache: (event) => {
    const query = getQuery(event)
    return query.fresh === '1' || query.fresh === 'true'
  }
})

/** Garante posts com curtidas/comentários reais (HN / DEV) no feed final. */
function ensureEngagementCoverage(
  feed: NewsItem[],
  pool: Array<NewsItem & { balanceKey: string }>,
  maxItems: number,
  minEngagement: number
): NewsItem[] {
  const result = [...feed]
  const urls = new Set(result.map(item => item.url))
  const engaged = () => result.filter(item => item.points > 0 || item.comments > 0).length

  if (engaged() >= minEngagement) return result.slice(0, maxItems)

  const extras = pool
    .filter(item => (item.points > 0 || item.comments > 0) && !urls.has(item.url))
    .sort((a, b) => (b.points + b.comments) - (a.points + a.comments))

  for (const extra of extras) {
    if (engaged() >= minEngagement) break
    const { balanceKey: _, ...item } = extra
    if (result.length >= maxItems) {
      const replaceAt = [...result].reverse().findIndex(candidate =>
        candidate.points === 0 && candidate.comments === 0 && candidate.topic === 'geral'
      )
      if (replaceAt === -1) break
      const index = result.length - 1 - replaceAt
      urls.delete(result[index]!.url)
      result[index] = item
    } else {
      result.push(item)
    }
    urls.add(item.url)
  }

  return result.slice(0, maxItems)
}

/** Garante pelo menos alguns itens por subtema, trocando os mais antigos do feed. */
function ensureTopicCoverage(
  feed: NewsItem[],
  pool: Array<NewsItem & { balanceKey: string }>,
  topics: NewsTopic[],
  maxItems: number,
  perTopic = 2
): NewsItem[] {
  const result = [...feed]
  const urls = new Set(result.map(item => item.url))

  for (const topic of topics) {
    const have = result.filter(item => item.topic === topic).length
    if (have >= perTopic) continue

    const extras = pool
      .filter(item => item.topic === topic && !urls.has(item.url))
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))

    for (const extra of extras.slice(0, perTopic - have)) {
      const { balanceKey: _, ...item } = extra
      if (result.length >= maxItems) {
        const replaceAt = [...result].reverse().findIndex(candidate => candidate.topic !== topic)
        if (replaceAt === -1) break
        const index = result.length - 1 - replaceAt
        urls.delete(result[index]!.url)
        result[index] = item
      } else {
        result.push(item)
      }
      urls.add(item.url)
    }
  }

  return result.slice(0, maxItems)
}
