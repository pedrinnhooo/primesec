/** Stacks / práticas agrupadas por tema (ícones + cor de marca no hover). */
import { CONTACT_EMAIL } from '#shared/constants/contact'

export const HOME_LOGO_GROUPS = [
  {
    id: 'frontend',
    items: [
      { id: 'nuxt', icon: 'i-simple-icons-nuxt', label: 'Nuxt', color: '#00DC82' },
      { id: 'vue', icon: 'i-simple-icons-vuedotjs', label: 'Vue', color: '#41B883' },
      { id: 'react', icon: 'i-simple-icons-react', label: 'React', color: '#61DAFB' },
      { id: 'typescript', icon: 'i-simple-icons-typescript', label: 'TypeScript', color: '#3178C6' },
      { id: 'flutter', icon: 'i-simple-icons-flutter', label: 'Flutter', color: '#02569B' },
      { id: 'figma', icon: 'i-simple-icons-figma', label: 'Figma', color: '#F24E1E' },
      { id: 'tailwind', icon: 'i-simple-icons-tailwindcss', label: 'Tailwind', color: '#06B6D4' },
      { id: 'vite', icon: 'i-simple-icons-vite', label: 'Vite', color: '#646CFF' },
      { id: 'pinia', icon: 'i-simple-icons-pinia', label: 'Pinia', color: '#FFD859' },
      { id: 'playwright', icon: 'i-simple-icons-playwright', label: 'Playwright', color: '#2EAD33' },
      { id: 'vitest', icon: 'i-simple-icons-vitest', label: 'Vitest', color: '#729B1B' },
      { id: 'vercel', icon: 'i-simple-icons-vercel', label: 'Vercel', color: '#FFFFFF' }
    ]
  },
  {
    id: 'platform',
    items: [
      { id: 'nodejs', icon: 'i-simple-icons-nodedotjs', label: 'Node.js', color: '#5FA04E' },
      { id: 'nestjs', icon: 'i-simple-icons-nestjs', label: 'NestJS', color: '#E0234E' },
      { id: 'python', icon: 'i-simple-icons-python', label: 'Python', color: '#3776AB' },
      { id: 'go', icon: 'i-simple-icons-go', label: 'Go', color: '#00ADD8' },
      { id: 'postgresql', icon: 'i-simple-icons-postgresql', label: 'PostgreSQL', color: '#4169E1' },
      { id: 'redis', icon: 'i-simple-icons-redis', label: 'Redis', color: '#FF4438' },
      { id: 'mongodb', icon: 'i-simple-icons-mongodb', label: 'MongoDB', color: '#47A248' },
      { id: 'prisma', icon: 'i-simple-icons-prisma', label: 'Prisma', color: '#5A67D8' },
      { id: 'docker', icon: 'i-simple-icons-docker', label: 'Docker', color: '#2496ED' },
      { id: 'kubernetes', icon: 'i-simple-icons-kubernetes', label: 'Kubernetes', color: '#326CE5' },
      { id: 'terraform', icon: 'i-simple-icons-terraform', label: 'Terraform', color: '#7B42BC' },
      { id: 'aws', icon: 'i-simple-icons-amazonwebservices', label: 'AWS', color: '#FF9900' }
    ]
  },
  {
    id: 'security',
    items: [
      { id: 'linux', icon: 'i-simple-icons-linux', label: 'Linux', color: '#FCC624' },
      { id: 'kali', icon: 'i-simple-icons-kalilinux', label: 'Kali', color: '#2777FF' },
      { id: 'burp', icon: 'i-simple-icons-burpsuite', label: 'Burp', color: '#FF6633' },
      { id: 'metasploit', icon: 'i-simple-icons-metasploit', label: 'Metasploit', color: '#2596CD' },
      { id: 'wireshark', icon: 'i-simple-icons-wireshark', label: 'Wireshark', color: '#1679A7' },
      { id: 'owasp', icon: 'i-simple-icons-owasp', label: 'OWASP', color: '#A4CF00' },
      { id: 'vault', icon: 'i-simple-icons-vault', label: 'Vault', color: '#FFEC6E' },
      { id: 'grafana', icon: 'i-simple-icons-grafana', label: 'Grafana', color: '#F46800' },
      { id: 'prometheus', icon: 'i-simple-icons-prometheus', label: 'Prometheus', color: '#E6522C' },
      { id: 'keycloak', icon: 'i-simple-icons-keycloak', label: 'Keycloak', color: '#4D9DE0' },
      { id: 'cloudflare', icon: 'i-simple-icons-cloudflare', label: 'Cloudflare', color: '#F38020' },
      { id: 'openssl', icon: 'i-simple-icons-openssl', label: 'OpenSSL', color: '#C8102E' }
    ]
  }
] as const

/** @deprecated prefer HOME_LOGO_GROUPS */
export const HOME_LOGO_ITEMS = HOME_LOGO_GROUPS.flatMap(g => [...g.items])

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
  logos: {
    title: string
    groups?: Record<string, string>
    tech?: Record<string, string>
  }
  features: {
    headline: string
    title: string
    description: string
    items: Array<{ id?: string, icon: string, title: string, description: string }>
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
        groups: HOME_LOGO_GROUPS.map(group => ({
          id: group.id,
          title: String(home.logos.groups?.[group.id] ?? group.id),
          items: group.items.map(item => ({
            ...item,
            description: String(home.logos.tech?.[item.id] ?? item.label)
          }))
        }))
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
