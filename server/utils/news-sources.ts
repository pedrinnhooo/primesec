import type { NewsCategory, NewsTopic } from '#shared/types/news'
import type { NewsLang } from './news-lang'
import type { RelevanceMode } from './news-filter'

export interface RssSourceConfig {
  url: string
  source: string
  sourceIcon: string
  category: NewsCategory
  balanceKey: string
  topic?: NewsTopic
  limit?: number
  requireRelevance?: RelevanceMode
}

interface GoogleNewsLocale {
  hl: string
  gl: string
  ceid: string
  sourceName: string
}

const GOOGLE_LOCALE: Record<NewsLang, GoogleNewsLocale> = {
  pt: { hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419', sourceName: 'Google Notícias' },
  en: { hl: 'en-US', gl: 'US', ceid: 'US:en', sourceName: 'Google News' },
  es: { hl: 'es', gl: 'ES', ceid: 'ES:es', sourceName: 'Google Noticias' }
}

export function googleNewsUrl(query: string, lang: NewsLang): string {
  const locale = GOOGLE_LOCALE[lang]
  const params = new URLSearchParams({
    q: query,
    hl: locale.hl,
    gl: locale.gl,
    ceid: locale.ceid
  })
  return `https://news.google.com/rss/search?${params.toString()}`
}

function googleSource(lang: NewsLang): Pick<RssSourceConfig, 'source' | 'sourceIcon' | 'balanceKey'> {
  return {
    source: GOOGLE_LOCALE[lang].sourceName,
    sourceIcon: 'i-simple-icons-googlenews',
    balanceKey: 'google-news'
  }
}

/** Feeds brasileiros — só no locale PT. */
function ptRssSources(): RssSourceConfig[] {
  const g = googleSource('pt')
  return [
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
      requireRelevance: 'cyber',
      limit: 12
    },
    {
      url: 'https://securityleaders.com.br/feed/',
      source: 'Security Leaders',
      sourceIcon: 'i-lucide-shield',
      category: 'ciberseguranca',
      balanceKey: 'security-leaders',
      requireRelevance: 'cyber',
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
    {
      url: googleNewsUrl('(("inteligência artificial" OR IA OR "machine learning" OR ChatGPT OR LLM) (cibersegurança OR cybersecurity OR ransomware OR malware OR "segurança da informação"))', 'pt'),
      ...g,
      category: 'ciberseguranca',
      topic: 'ia',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("red team" OR pentest OR "teste de invasão") (cibersegurança OR cybersecurity OR segurança)', 'pt'),
      ...g,
      category: 'ciberseguranca',
      topic: 'redteam',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("blue team" OR "security operations" OR SIEM OR XDR) (cibersegurança OR "resposta a incidentes")', 'pt'),
      ...g,
      category: 'ciberseguranca',
      topic: 'blueteam',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('"purple team" (cibersegurança OR cybersecurity OR segurança)', 'pt'),
      ...g,
      category: 'ciberseguranca',
      topic: 'purpleteam',
      requireRelevance: 'cyber',
      limit: 6
    },
    {
      url: googleNewsUrl('(LGPD OR ANPD OR "proteção de dados") (empresa OR vazamento OR multa OR conformidade)', 'pt'),
      ...g,
      category: 'ciberseguranca',
      topic: 'lgpd-grc',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: 'https://tecnoblog.net/feed/',
      source: 'Tecnoblog',
      sourceIcon: 'i-lucide-newspaper',
      category: 'tecnologia',
      balanceKey: 'tecnoblog',
      requireRelevance: 'tech',
      limit: 20
    },
    {
      url: 'https://canaltech.com.br/rss/',
      source: 'Canaltech',
      sourceIcon: 'i-lucide-cpu',
      category: 'tecnologia',
      balanceKey: 'canaltech',
      requireRelevance: 'tech',
      limit: 18
    },
    {
      url: 'https://olhardigital.com.br/feed/',
      source: 'Olhar Digital',
      sourceIcon: 'i-lucide-eye',
      category: 'tecnologia',
      balanceKey: 'olhar-digital',
      requireRelevance: 'tech',
      limit: 12
    },
    {
      url: 'https://canaltech.com.br/rss/inteligencia-artificial/',
      source: 'Canaltech',
      sourceIcon: 'i-lucide-cpu',
      category: 'tecnologia',
      balanceKey: 'canaltech',
      topic: 'ia',
      requireRelevance: 'tech',
      limit: 16
    },
    {
      url: 'https://olhardigital.com.br/tag/inteligencia-artificial/feed/',
      source: 'Olhar Digital',
      sourceIcon: 'i-lucide-eye',
      category: 'tecnologia',
      balanceKey: 'olhar-digital',
      topic: 'ia',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('("UI/UX" OR "experiência do usuário" OR "design de interface" OR Figma) (produto OR app OR site)', 'pt'),
      ...g,
      category: 'tecnologia',
      topic: 'uiux',
      requireRelevance: 'tech',
      limit: 8
    },
    {
      url: googleNewsUrl('(frontend OR "front-end" OR React OR Vue OR Next.js OR CSS) (desenvolvimento OR framework OR web)', 'pt'),
      ...g,
      category: 'tecnologia',
      topic: 'frontend',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(backend OR "back-end" OR "Node.js" OR API OR GraphQL OR microserviços) (desenvolvimento OR software)', 'pt'),
      ...g,
      category: 'tecnologia',
      topic: 'backend',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(PostgreSQL OR MySQL OR MongoDB OR Redis OR SQLite OR "NoSQL" OR Prisma) (database OR desenvolvimento OR software)', 'pt'),
      ...g,
      category: 'tecnologia',
      topic: 'database',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      // Flutter em destaque + RN / iOS / Android
      url: googleNewsUrl('(Flutter OR Dart OR "React Native" OR Expo OR Android OR iOS OR SwiftUI OR "Jetpack Compose") (mobile OR app OR desenvolvimento)', 'pt'),
      ...g,
      category: 'tecnologia',
      topic: 'mobile',
      requireRelevance: 'tech',
      limit: 12
    },
    {
      url: googleNewsUrl('Flutter (Dart OR framework OR mobile OR app OR Google) (desenvolvimento OR lançamento OR atualização)', 'pt'),
      ...g,
      category: 'tecnologia',
      topic: 'mobile',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: 'https://canaltech.com.br/rss/software/',
      source: 'Canaltech',
      sourceIcon: 'i-lucide-cpu',
      category: 'tecnologia',
      balanceKey: 'canaltech',
      requireRelevance: 'tech',
      limit: 16
    }
  ]
}

/** Feeds em inglês — locale EN (e apoio de programação no ES). */
function enRssSources(lang: NewsLang = 'en'): RssSourceConfig[] {
  const g = googleSource(lang)
  return [
    {
      url: 'https://feeds.feedburner.com/TheHackersNews',
      source: 'The Hacker News',
      sourceIcon: 'i-lucide-shield-alert',
      category: 'ciberseguranca',
      balanceKey: 'the-hacker-news',
      limit: 20
    },
    {
      url: 'https://www.bleepingcomputer.com/feed/',
      source: 'BleepingComputer',
      sourceIcon: 'i-lucide-shield',
      category: 'ciberseguranca',
      balanceKey: 'bleeping-computer',
      limit: 16
    },
    {
      url: 'https://krebsonsecurity.com/feed/',
      source: 'Krebs on Security',
      sourceIcon: 'i-lucide-lock',
      category: 'ciberseguranca',
      balanceKey: 'krebs',
      limit: 12
    },
    {
      url: googleNewsUrl('("artificial intelligence" OR AI OR "machine learning" OR ChatGPT OR LLM) (cybersecurity OR ransomware OR malware OR "information security")', lang),
      ...g,
      category: 'ciberseguranca',
      topic: 'ia',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("red team" OR pentest OR "penetration test") (cybersecurity OR security)', lang),
      ...g,
      category: 'ciberseguranca',
      topic: 'redteam',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("blue team" OR "security operations" OR SIEM OR XDR OR "incident response") cybersecurity', lang),
      ...g,
      category: 'ciberseguranca',
      topic: 'blueteam',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('"purple team" (cybersecurity OR security)', lang),
      ...g,
      category: 'ciberseguranca',
      topic: 'purpleteam',
      requireRelevance: 'cyber',
      limit: 6
    },
    {
      url: googleNewsUrl('(GDPR OR "data protection" OR privacy) (breach OR fine OR compliance OR company)', lang),
      ...g,
      category: 'ciberseguranca',
      topic: 'lgpd-grc',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: 'https://techcrunch.com/feed/',
      source: 'TechCrunch',
      sourceIcon: 'i-lucide-newspaper',
      category: 'tecnologia',
      balanceKey: 'techcrunch',
      requireRelevance: 'tech',
      limit: 16
    },
    {
      url: 'https://www.theverge.com/rss/index.xml',
      source: 'The Verge',
      sourceIcon: 'i-lucide-cpu',
      category: 'tecnologia',
      balanceKey: 'the-verge',
      requireRelevance: 'tech',
      limit: 14
    },
    {
      url: googleNewsUrl('("UI/UX" OR "user experience" OR "interface design" OR Figma) (product OR app OR website)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'uiux',
      requireRelevance: 'tech',
      limit: 8
    },
    {
      url: googleNewsUrl('(frontend OR "front-end" OR React OR Vue OR "Next.js" OR CSS) (development OR framework OR web)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'frontend',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(backend OR "back-end" OR "Node.js" OR API OR GraphQL OR microservices) (development OR software)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'backend',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(PostgreSQL OR MySQL OR MongoDB OR Redis OR SQLite OR NoSQL OR Prisma) (database OR development OR software)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'database',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(Flutter OR Dart OR "React Native" OR Expo OR Android OR iOS OR SwiftUI OR "Jetpack Compose") (mobile OR app OR development)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'mobile',
      requireRelevance: 'tech',
      limit: 12
    },
    {
      url: googleNewsUrl('Flutter (Dart OR framework OR mobile OR app OR Google) (development OR release OR update)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'mobile',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('("artificial intelligence" OR AI OR ChatGPT OR OpenAI OR Anthropic) (tech OR software OR model)', lang),
      ...g,
      category: 'tecnologia',
      topic: 'ia',
      requireRelevance: 'tech',
      limit: 12
    }
  ]
}

/** Feeds em espanhol + Google ES. */
function esRssSources(): RssSourceConfig[] {
  const g = googleSource('es')
  return [
    {
      url: 'https://www.xataka.com/feedburner.xml',
      source: 'Xataka',
      sourceIcon: 'i-lucide-cpu',
      category: 'tecnologia',
      balanceKey: 'xataka',
      requireRelevance: 'tech',
      limit: 16
    },
    {
      url: 'https://www.genbeta.com/feedburner.xml',
      source: 'Genbeta',
      sourceIcon: 'i-lucide-newspaper',
      category: 'tecnologia',
      balanceKey: 'genbeta',
      requireRelevance: 'tech',
      limit: 12
    },
    {
      url: googleNewsUrl('("inteligencia artificial" OR IA OR "machine learning" OR ChatGPT) (ciberseguridad OR ransomware OR malware OR "seguridad de la información")', 'es'),
      ...g,
      category: 'ciberseguranca',
      topic: 'ia',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("red team" OR pentest OR "test de penetración") (ciberseguridad OR seguridad)', 'es'),
      ...g,
      category: 'ciberseguranca',
      topic: 'redteam',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("blue team" OR SIEM OR XDR OR "respuesta a incidentes") ciberseguridad', 'es'),
      ...g,
      category: 'ciberseguranca',
      topic: 'blueteam',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('"purple team" (ciberseguridad OR seguridad)', 'es'),
      ...g,
      category: 'ciberseguranca',
      topic: 'purpleteam',
      requireRelevance: 'cyber',
      limit: 6
    },
    {
      url: googleNewsUrl('(RGPD OR GDPR OR "protección de datos" OR privacidad) (empresa OR filtración OR multa OR cumplimiento)', 'es'),
      ...g,
      category: 'ciberseguranca',
      topic: 'lgpd-grc',
      requireRelevance: 'cyber',
      limit: 8
    },
    {
      url: googleNewsUrl('("UI/UX" OR "experiencia de usuario" OR Figma) (producto OR app OR web)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'uiux',
      requireRelevance: 'tech',
      limit: 8
    },
    {
      url: googleNewsUrl('(frontend OR "front-end" OR React OR Vue OR "Next.js") (desarrollo OR framework OR web)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'frontend',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(backend OR "back-end" OR "Node.js" OR API OR GraphQL) (desarrollo OR software)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'backend',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(PostgreSQL OR MySQL OR MongoDB OR Redis OR SQLite OR Prisma) (base de datos OR desarrollo OR software)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'database',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('(Flutter OR Dart OR "React Native" OR Expo OR Android OR iOS OR SwiftUI OR "Jetpack Compose") (móvil OR app OR desarrollo)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'mobile',
      requireRelevance: 'tech',
      limit: 12
    },
    {
      url: googleNewsUrl('Flutter (Dart OR framework OR móvil OR app OR Google) (desarrollo OR lanzamiento OR actualización)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'mobile',
      requireRelevance: 'tech',
      limit: 10
    },
    {
      url: googleNewsUrl('("inteligencia artificial" OR IA OR ChatGPT OR OpenAI) (tecnología OR software OR modelo)', 'es'),
      ...g,
      category: 'tecnologia',
      topic: 'ia',
      requireRelevance: 'tech',
      limit: 12
    },
    // Fontes EN de segurança como complemento (filtradas por idioma no handler se necessário)
    {
      url: 'https://feeds.feedburner.com/TheHackersNews',
      source: 'The Hacker News',
      sourceIcon: 'i-lucide-shield-alert',
      category: 'ciberseguranca',
      balanceKey: 'the-hacker-news',
      limit: 12
    }
  ]
}

export function allRssSources(): RssSourceConfig[] {
  const seen = new Set<string>()
  const merged = [...ptRssSources(), ...enRssSources('en'), ...esRssSources()]
  return merged.filter((source) => {
    if (seen.has(source.url)) return false
    seen.add(source.url)
    return true
  })
}

/** @deprecated use allRssSources — mantido por compat. */
export function rssSourcesForLang(_lang: NewsLang): RssSourceConfig[] {
  return allRssSources()
}

export function isGoogleNewsSource(source: string): boolean {
  return source === 'Google Notícias'
    || source === 'Google News'
    || source === 'Google Noticias'
}

export function googlePublisherLabel(lang: NewsLang): string {
  return GOOGLE_LOCALE[lang].sourceName
}
