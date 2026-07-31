export type NewsCategory = 'tecnologia' | 'ciberseguranca'

/** Subtema opcional dentro de uma categoria. */
export type NewsTopic =
  | 'geral'
  | 'ia'
  | 'uiux'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'mobile'
  | 'redteam'
  | 'blueteam'
  | 'purpleteam'
  | 'lgpd-grc'

/** Etiqueta dentro do subtema Mobile (tecnologia). */
export type NewsTag =
  | 'flutter'
  | 'react-native'
  | 'ios'
  | 'android'

export interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  sourceIcon: string
  category: NewsCategory
  topic?: NewsTopic
  /** Etiquetas finas (ex.: Flutter dentro de Mobile). */
  tags?: NewsTag[]
  publishedAt: string
  points: number
  comments: number
  description?: string | null
}

export interface NewsFeed {
  updatedAt: string
  items: NewsItem[]
}
