export type NewsLang = 'pt' | 'en' | 'es'

export function resolveNewsLang(raw: unknown): NewsLang {
  const value = String(Array.isArray(raw) ? raw[0] : raw || 'pt').toLowerCase()
  if (value === 'en' || value === 'es' || value === 'pt') return value
  return 'pt'
}

/** Palavras/sinais tipicamente portugueses (não aparecem no inglês). */
const PORTUGUESE_MARKERS = [
  /\bnão\b/i,
  /\bvocê\b/i,
  /\btambém\b/i,
  /\binforma[cç][aã]o\b/i,
  /\bseguran[cç]a\b/i,
  /\btecnologia\b/i,
  /\bvulnerabilidade\b/i,
  /\batualiza[cç][aã]o\b/i,
  /\bdesenvolvimento\b/i,
  /\bap[oó]s\b/i,
  /\bpela\b/i,
  /\bpelo\b/i,
  /\bdos\b/i,
  /\bdas\b/i,
  /\best[aá]\b/i,
  /\bs[aã]o\b/i,
  /\buma\b/i,
  /\bpara\b/i,
  /[áàâãéêíóôõúç]/i
]

/** Sinais tipicamente espanhóis. */
const SPANISH_MARKERS = [
  /\bseguridad\b/i,
  /\btecnolog[ií]a\b/i,
  /\bdesarrollo\b/i,
  /\bvulnerabilidad\b/i,
  /\bactuali[sz]aci[oó]n\b/i,
  /\btambi[eé]n\b/i,
  /\binformaci[oó]n\b/i,
  /\bpara\b/i,
  /\bcomo\b/i,
  /\best[aá]\b/i,
  /[ñ¿¡]/i,
  /[áéíóúü]/i
]

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0)
}

/**
 * Garante que o título/descrição combina com o idioma do site.
 * EN rejeita português; PT rejeita inglês puro; ES aceita ES e rejeita PT-BR óbvio.
 */
export function matchesNewsLanguage(text: string, lang: NewsLang): boolean {
  const sample = text.slice(0, 500)
  const ptScore = countMatches(sample, PORTUGUESE_MARKERS)
  const esScore = countMatches(sample, SPANISH_MARKERS)
  const hasEnglish = /\b(the|and|with|from|that|this|security|vulnerability|database|software|update)\b/i.test(sample)

  if (lang === 'en') {
    // Bloqueia PT e ES no detector de "já está em inglês".
    if (ptScore >= 2 || esScore >= 2) return false
    if (/\b(não|você|também|también|seguridad|tecnología|información|ciberseguridad)\b/i.test(sample)) {
      return false
    }
    return true
  }

  if (lang === 'pt') {
    if (ptScore >= 1) return true
    // Inglês ou espanhol puro → precisa traduzir.
    if ((hasEnglish || esScore >= 2) && ptScore === 0) return false
    return true
  }

  // es: confirma espanhol; inglês técnico pode passar sem traduzir.
  if (esScore >= 2) return true
  if (/\b(seguridad|tecnología|desarrollo|también|información)\b/i.test(sample)) return true
  if (/\b(não|você|também|cibersegurança|segurança da informação)\b/i.test(sample)) return false
  return hasEnglish
}
