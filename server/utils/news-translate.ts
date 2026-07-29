import { createHash } from 'node:crypto'
import type { NewsItem } from '#shared/types/news'
import type { NewsLang } from './news-lang'

const TARGET_CODE: Record<NewsLang, string> = {
  pt: 'pt',
  en: 'en',
  es: 'es'
}

/** Cache em memória: mesma matéria não é retraduzida a cada refresh do feed. */
const translationCache = new Map<string, string>()
const MAX_CACHE = 4_000

function cacheKey(text: string, to: NewsLang): string {
  return `${to}:${createHash('sha1').update(text).digest('hex').slice(0, 16)}`
}

function remember(key: string, value: string): string {
  if (translationCache.size >= MAX_CACHE) {
    const first = translationCache.keys().next().value
    if (first) translationCache.delete(first)
  }
  translationCache.set(key, value)
  return value
}

function parseGoogleTranslatePayload(payload: unknown): string {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return ''
  return payload[0]
    .map((part) => (Array.isArray(part) ? String(part[0] ?? '') : ''))
    .join('')
    .trim()
}

async function translateText(text: string, to: NewsLang): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return text

  const key = cacheKey(trimmed, to)
  const cached = translationCache.get(key)
  if (cached) return cached

  try {
    const payload = await $fetch<unknown>('https://translate.googleapis.com/translate_a/single', {
      query: {
        client: 'gtx',
        sl: 'auto',
        tl: TARGET_CODE[to],
        dt: 't',
        q: trimmed
      },
      timeout: 8_000,
      retry: 1
    })
    const translated = parseGoogleTranslatePayload(payload)
    if (!translated) return text
    return remember(key, translated)
  } catch {
    return text
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await mapper(items[index]!)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  )
  await Promise.all(workers)
  return results
}

/** Traduz título e descrição dos cards para o locale ativo. */
export async function translateNewsItems(
  items: NewsItem[],
  to: NewsLang
): Promise<NewsItem[]> {
  return mapPool(items, 8, async (item) => {
    const [title, description] = await Promise.all([
      translateText(item.title, to),
      item.description ? translateText(item.description, to) : Promise.resolve(item.description)
    ])

    if (title === item.title && description === item.description) return item
    return { ...item, title, description }
  })
}
