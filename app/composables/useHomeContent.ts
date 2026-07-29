/** Ícones de stack (não traduzíveis). */
import { CONTACT_EMAIL } from '#shared/constants/contact'

export const HOME_LOGO_ITEMS = [
  'i-simple-icons-nuxtdotjs',
  'i-simple-icons-vuedotjs',
  'i-simple-icons-react',
  'i-simple-icons-typescript',
  'i-simple-icons-amazonaws'
] as const

interface HomeLink {
  label: string
  color?: string
  size?: string
  variant?: string
  route?: string
  hash?: string
}

interface HomeContent {
  seo: { title: string, description: string }
  title: string
  description: string
  hero: { headline: string, links: HomeLink[] }
  terminal: {
    lines: Array<{ segments: Array<{ text: string, style: string }> }>
  }
  logos: { title: string }
  features: {
    headline: string
    title: string
    description: string
    items: Array<{ icon: string, title: string, description: string }>
  }
  metrics: {
    headline: string
    title: string
    description: string
    items: Array<{ value: string, label: string, class: string }>
  }
  cta: {
    title: string
    description: string
    command: string
    links: HomeLink[]
  }
}

function resolveLink(link: HomeLink, localePath: (route: string) => string) {
  const { route, hash, ...rest } = link
  if (hash) {
    return { ...rest, to: `${localePath('index')}${hash}` }
  }
  if (route) {
    return { ...rest, to: localePath(route) }
  }
  return { ...rest, to: localePath('index') }
}

function resolveNode(node: unknown, rt: (message: never) => string): unknown {
  if (node == null || typeof node === 'boolean' || typeof node === 'number') {
    return node
  }
  if (typeof node === 'string') {
    return node
  }
  if (typeof node === 'function') {
    return rt(node as never)
  }
  if (Array.isArray(node)) {
    return node.map(item => resolveNode(item, rt))
  }
  if (typeof node === 'object') {
    // Message AST do intlify
    if ('type' in node || 'b' in node || 'body' in node) {
      return rt(node as never)
    }
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node)) {
      out[key] = resolveNode(value, rt)
    }
    return out
  }
  return node
}

/** Conteúdo da home a partir das mensagens i18n do locale ativo. */
export function useHomeContent() {
  const { tm, rt, locale } = useI18n()
  const localePath = useLocalePath()

  return computed(() => {
    void locale.value
    const raw = tm('home')
    if (!raw || typeof raw !== 'object') {
      throw createError({ statusCode: 500, statusMessage: 'Home translations missing', fatal: true })
    }
    const home = resolveNode(raw, rt) as HomeContent

    return {
      seo: home.seo,
      title: home.title,
      description: home.description,
      hero: {
        headline: home.hero.headline,
        links: home.hero.links.map(link => resolveLink(link, localePath))
      },
      terminal: home.terminal,
      logos: {
        title: home.logos.title,
        items: [...HOME_LOGO_ITEMS]
      },
      features: home.features,
      metrics: home.metrics,
      cta: {
        ...home.cta,
        command: CONTACT_EMAIL,
        links: home.cta.links.map(link => resolveLink(link, localePath))
      }
    }
  })
}
