export interface RssItem {
  title: string
  link: string
  description: string | null
  publishedAt: string
  categories: string[]
  /** Nome do veículo quando o feed agrega (ex.: Google Notícias). */
  publisher?: string | null
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&apos;/g, '\'')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
}

export function stripHtml(value: string): string {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tagContent(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  const raw = match?.[1]
  if (!raw) return null
  return decodeEntities(raw).trim() || null
}

function tagAttr(block: string, tag: string, attr: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?\\s${attr}="([^"]+)"`, 'i'))
  const raw = match?.[1]
  return raw ? decodeEntities(raw) : null
}

function allTagContents(block: string, tag: string): string[] {
  const values: string[] = []
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  let match: RegExpExecArray | null
  while ((match = re.exec(block)) !== null) {
    const raw = match[1]
    if (!raw) continue
    const value = decodeEntities(raw).trim()
    if (value) values.push(value)
  }
  return values
}

function toIsoDate(value: string | null): string {
  if (!value) return new Date().toISOString()
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString()
}

/** Extrai itens de um feed RSS 2.0 / Atom leve (sem dependência extra). */
export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1]
    if (!block) continue

    const titleRaw = tagContent(block, 'title')
    const title = titleRaw ? stripHtml(titleRaw) : ''
    const link = tagContent(block, 'link')
      || tagAttr(block, 'link', 'href')
      || tagContent(block, 'guid')
    if (!title || !link) continue

    const descriptionRaw = tagContent(block, 'description') || tagContent(block, 'content:encoded')
    const description = descriptionRaw ? stripHtml(descriptionRaw).slice(0, 280) || null : null
    const publisher = tagContent(block, 'source')

    items.push({
      title,
      link: link.trim(),
      description,
      publishedAt: toIsoDate(tagContent(block, 'pubDate') || tagContent(block, 'dc:date')),
      categories: allTagContents(block, 'category').map(stripHtml).filter(Boolean),
      publisher
    })
  }

  return items
}
