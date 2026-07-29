import type { NewsCategory, NewsItem, NewsTopic } from '#shared/types/news'
import { inferNewsTopic, matchesTopic } from './news-topics'

const FETCH_OPTIONS = {
  timeout: 8_000,
  retry: 1
} as const

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

/** Hacker News (Algolia) — pontos e comentários reais. */
export async function fetchHackerNews(options: {
  category: NewsCategory
  topic: NewsTopic
  query: string
  limit?: number
}): Promise<NewsItem[]> {
  const limit = options.limit ?? 12
  const endpoint = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${encodeURIComponent(options.query)}&hitsPerPage=${limit}&numericFilters=points>2`

  const { hits } = await $fetch<{ hits: HNHit[] }>(endpoint, FETCH_OPTIONS)

  return hits
    .filter((hit): hit is HNHit & { title: string } => Boolean(hit.title))
    .filter(hit => matchesTopic(hit.title, options.topic))
    .map(hit => ({
      id: `hn-${hit.objectID}`,
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      source: 'Hacker News',
      sourceIcon: 'i-simple-icons-ycombinator',
      category: options.category,
      topic: options.topic,
      publishedAt: hit.created_at,
      points: hit.points ?? 0,
      comments: hit.num_comments ?? 0
    }))
}

/** DEV Community — reações e comentários reais. */
export async function fetchDevTo(options: {
  tag: string
  category: NewsCategory
  topic: NewsTopic
  limit?: number
}): Promise<NewsItem[]> {
  const articles = await $fetch<DevToArticle[]>('https://dev.to/api/articles', {
    ...FETCH_OPTIONS,
    params: {
      tag: options.tag,
      per_page: options.limit ?? 12
    }
  })

  return articles.map((article) => {
    const haystack = [article.title, article.description || ''].join(' ')
    const topic = matchesTopic(haystack, options.topic)
      ? options.topic
      : (inferNewsTopic(haystack) ?? options.topic)

    return {
      id: `devto-${article.id}`,
      title: article.title,
      url: article.url,
      source: 'DEV Community',
      sourceIcon: 'i-simple-icons-devdotto',
      category: options.category,
      topic,
      publishedAt: article.published_at,
      points: article.positive_reactions_count ?? 0,
      comments: article.comments_count ?? 0,
      description: article.description
    }
  })
}
