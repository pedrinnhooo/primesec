export type MetricId = 'departments' | 'services' | 'security' | 'e2e'

export interface MetricDetail {
  id: MetricId
  value: string
  label: string
  class?: string
  icon: string
  title: string
  description: string
  about: string
  highlights: string[]
  /** Rótulos usados no desenho temático. */
  nodes: string[]
}

export const METRIC_IDS: MetricId[] = ['departments', 'services', 'security', 'e2e']

export const METRIC_ICONS: Record<MetricId, string> = {
  departments: 'i-lucide-building-2',
  services: 'i-lucide-layout-grid',
  security: 'i-lucide-shield',
  e2e: 'i-lucide-route'
}
