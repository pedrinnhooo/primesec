import { createHash } from 'node:crypto'
import type { NewsCategory, NewsFeed, NewsItem, NewsTopic } from '#shared/types/news'
import { inferNewsTopic, matchesTopic } from '../utils/news-topics'
import { parseRss } from '../utils/rss'

const FETCH_OPTIONS = {
  timeout: 10_000,
  retry: 1,
  responseType: 'text' as const,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; PrimeSecNewsBot/1.0; +https://primesec.com.br)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*'
  }
}

interface RssSourceConfig {
  url: string
  source: string
  sourceIcon: string
  category: NewsCategory
  /** Chave de balanceamento (agrupa feeds do mesmo veículo). */
  balanceKey: string
  /** Força o subtema quando o feed já é temático. */
  topic?: NewsTopic
  limit?: number
}

const RSS_SOURCES: RssSourceConfig[] = [
  // —— Cibersegurança (PT-BR) ——
  {
    url: 'https://www.cisoadvisor.com.br/feed/',
    source: 'CISO Advisor',
    sourceIcon: 'i-lucide-shield-alert',
    category: 'ciberseguranca',
    balanceKey: 'ciso-advisor',
    limit: 28
  },
  {
    url: 'https://canaltech.com.br/rss/seguranca/',
    source: 'Canaltech',
    sourceIcon: 'i-lucide-cpu',
    category: 'ciberseguranca',
    balanceKey: 'canaltech',
    limit: 16
  },
  {
    url: 'https://cryptoid.com.br/feed/',
    source: 'CryptoID',
    sourceIcon: 'i-lucide-fingerprint',
    category: 'ciberseguranca',
    balanceKey: 'cryptoid',
    limit: 12
  },
  {
    url: 'https://securityleaders.com.br/feed/',
    source: 'Security Leaders',
    sourceIcon: 'i-lucide-shield',
    category: 'ciberseguranca',
    balanceKey: 'security-leaders',
    limit: 12
  },
  {
    url: 'https://totalsecurity.com.br/feed/seguranca.xml',
    source: 'Total Security',
    sourceIcon: 'i-lucide-lock',
    category: 'ciberseguranca',
    balanceKey: 'total-security',
    limit: 14
  },
  {
    url: 'https://www.cert.br/rss/certbr-rss.xml',
    source: 'CERT.br',
    sourceIcon: 'i-lucide-landmark',
    category: 'ciberseguranca',
    balanceKey: 'cert-br',
    limit: 10
  },
  // Subtemas cyber (Google Notícias PT-BR) — volume baixo, queries precisas
  {
    url: googleNewsUrl('("red team" OR pentest OR "teste de invasão") (cibersegurança OR cybersecurity OR segurança)'),
    source: 'Google Notícias',
    sourceIcon: 'i-simple-icons-googlenews',
    category: 'ciberseguranca',
    balanceKey: 'google-news',
    topic: 'redteam',
    limit: 8
  },
  {
    url: googleNewsUrl('("blue team" OR "security operations" OR SIEM OR XDR) (cibersegurança OR "resposta a incidentes")'),
    source: 'Google Notícias',
    sourceIcon: 'i-simple-icons-googlenews',
    category: 'ciberseguranca',
    balanceKey: 'google-news',
    topic: 'blueteam',
    limit: 8
  },
  {
    url: googleNewsUrl('"purple team" (cibersegurança OR cybersecurity OR segurança)'),
    source: 'Google Notícias',
    sourceIcon: 'i-simple-icons-googlenews',
    category: 'ciberseguranca',
    balanceKey: 'google-news',
    topic: 'purpleteam',
    limit: 6
  },
  {
    url: googleNewsUrl('(LGPD OR ANPD OR "proteção de dados") (empresa OR vazamento OR multa OR conformidade)'),
    source: 'Google Notícias',
    sourceIcon: 'i-simple-icons-googlenews',
    category: 'ciberseguranca',
    balanceKey: 'google-news',
    topic: 'lgpd-grc',
    limit: 8
  },

  // —— Tecnologia (PT-BR) ——
  {
    url: 'https://tecnoblog.net/feed/',
    source: 'Tecnoblog',
    sourceIcon: 'i-lucide-newspaper',
    category: 'tecnologia',
    balanceKey: 'tecnoblog',
    limit: 20
  },
  {
    url: 'https://canaltech.com.br/rss/',
    source: 'Canaltech',
    sourceIcon: 'i-lucide-cpu',
    category: 'tecnologia',
    balanceKey: 'canaltech',
    limit: 18
  },
  {
    url: 'https://olhardigital.com.br/feed/',
    source: 'Olhar Digital',
    sourceIcon: 'i-lucide-eye',
    category: 'tecnologia',
    balanceKey: 'olhar-digital',
    limit: 12
  },
  {
    url: 'https://totalsecurity.com.br/feed.xml',
    source: 'Total Security',
    sourceIcon: 'i-lucide-lock',
    category: 'tecnologia',
    balanceKey: 'total-security',
    limit: 10
  },
  // Subtemas tech
  {
    url: 'https://canaltech.com.br/rss/inteligencia-artificial/',
    source: 'Canaltech',
    sourceIcon: 'i-lucide-cpu',
    category: 'tecnologia',
    balanceKey: 'canaltech',
    topic: 'ia',
    limit: 16
  },
  {
    url: 'https://olhardigital.com.br/tag/inteligencia-artificial/feed/',
    source: 'Olhar Digital',
    sourceIcon: 'i-lucide-eye',
    category: 'tecnologia',
    balanceKey: 'olhar-digital',
    topic: 'ia',
    limit: 10
  },
  {
    url: googleNewsUrl('("UI/UX" OR "experiência do usuário" OR "design de interface" OR Figma) (produto OR app OR site)'),
    source: 'Google Notícias',
    sourceIcon: 'i-simple-icons-googlenews',
    category: 'tecnologia',
    balanceKey: 'google-news',
    topic: 'uiux',
    limit: 8
  },
  {
    url: 'https://canaltech.com.br/rss/software/',
    source: 'Canaltech',
    sourceIcon: 'i-lucide-cpu',
    category: 'tecnologia',
    balanceKey: 'canaltech',
    topic: 'programacao',
    limit: 16
  },
  {
    url: googleNewsUrl('("desenvolvimento de software" OR frontend OR backend OR "engenharia de software" OR TypeScript OR "React Native")'),
    source: 'Google Notícias',
    sourceIcon: 'i-simple-icons-googlenews',
    category: 'tecnologia',
    balanceKey: 'google-news',
    topic: 'programacao',
    limit: 10
  }
]

function googleNewsUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: 'pt-BR',
    gl: 'BR',
    ceid: 'BR:pt-419'
  })
  return `https://news.google.com/rss/search?${params.toString()}`
}

function itemId(source: string, url: string): string {
  return createHash('sha1').update(`${source}:${url}`).digest('hex').slice(0, 16)
}

async function fetchRssSource(config: RssSourceConfig): Promise<Array<NewsItem & { balanceKey: string }>> {
  const xml = await $fetch<string>(config.url, FETCH_OPTIONS)
  if (typeof xml !== 'string' || !xml.includes('<item')) {
    throw createError({ statusCode: 502, statusMessage: `Feed inválido: ${config.source}` })
  }

  const parsed = parseRss(xml).slice(0, config.limit ?? 15)

  return parsed.flatMap((entry) => {
    const haystack = [entry.title, entry.description || '', ...entry.categories].join(' ')

    // Google Notícias é amplo: filtra ruído, exceto Purple Team (poucas matérias em PT-BR).
    if (
      config.topic
      && config.balanceKey === 'google-news'
      && config.topic !== 'purpleteam'
      && !matchesTopic(haystack, config.topic)
    ) {
      return []
    }

    const topic = inferNewsTopic(haystack, config.topic)
    const sourceName = entry.publisher && config.source === 'Google Notícias'
      ? `${entry.publisher} via Google Notícias`
      : config.source

    return [{
      id: itemId(config.balanceKey, entry.link),
      title: entry.title,
      url: entry.link,
      source: sourceName,
      sourceIcon: config.sourceIcon,
      category: config.category,
      topic,
      publishedAt: entry.publishedAt,
      points: 0,
      comments: 0,
      description: entry.description,
      balanceKey: config.balanceKey
    }]
  })
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

export default defineCachedEventHandler(async (): Promise<NewsFeed> => {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchRssSource))

  const items = results.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value
    return []
  })

  if (!items.length) {
    throw createError({ statusCode: 502, statusMessage: 'Nenhuma fonte de notícias respondeu' })
  }

  // Dedup por URL: preferimos item com subtema e descrição mais rica.
  const byUrl = new Map<string, NewsItem & { balanceKey: string }>()
  for (const item of items) {
    const key = item.url.replace(/\/+$/, '')
    const existing = byUrl.get(key)
    if (!existing) {
      byUrl.set(key, item)
      continue
    }
    const score = (candidate: NewsItem) =>
      (candidate.topic ? 1000 : 0)
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
  return {
    updatedAt: new Date().toISOString(),
    items: ensureTopicCoverage(balanced, deduped, [
      'redteam',
      'blueteam',
      'purpleteam',
      'lgpd-grc',
      'ia',
      'uiux',
      'programacao'
    ], 90)
  }
}, {
  name: 'live-news',
  getKey: () => 'ptbr-topics-v4',
  maxAge: 120,
  swr: false,
  shouldBypassCache: (event) => {
    const query = getQuery(event)
    return query.fresh === '1' || query.fresh === 'true'
  }
})

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
        // Remove do fim (mais antigo no intercalamento) um item sem o mesmo topic.
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