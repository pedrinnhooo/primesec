export type NewsCategory = 'tecnologia' | 'ciberseguranca'

/** Subtema opcional dentro de uma categoria (ex.: IA e UI/UX em tecnologia). */
export type NewsTopic = 'ia' | 'uiux'

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
