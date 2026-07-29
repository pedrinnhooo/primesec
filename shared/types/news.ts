export type NewsCategory = 'tecnologia' | 'ciberseguranca'

/** Subtema opcional dentro de uma categoria. */
export type NewsTopic =
  | 'geral'
  | 'ia'
  | 'uiux'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'redteam'
  | 'blueteam'
  | 'purpleteam'
  | 'lgpd-grc'

export interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  sourceIcon: string
  category: NewsCategory
  topic?: NewsTopic
  publishedAt: string
  points: number
  comments: number
  description?: string | null
}

export interface NewsFeed {
  updatedAt: string
  items: NewsItem[]
}
