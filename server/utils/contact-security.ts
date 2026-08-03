import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const CHALLENGE_MIN_AGE_MS = 2_000
const CHALLENGE_MAX_AGE_MS = 30 * 60 * 1000

function resolveSecret(): string {
  const config = useRuntimeConfig()
  const secret = config.contactHmacSecret
  if (typeof secret === 'string' && secret.length >= 16) {
    return secret
  }
  // Fallback só para dev/preview — em produção defina NUXT_CONTACT_HMAC_SECRET.
  if (import.meta.dev) {
    return 'secfocus-dev-contact-hmac-secret'
  }
  throw createError({
    statusCode: 500,
    statusMessage: 'Contact HMAC secret não configurado'
  })
}

function sign(payload: string): string {
  return createHmac('sha256', resolveSecret()).update(payload).digest('hex')
}

/** Emite challenge com nonce criptográfico + HMAC-SHA256. */
export function createContactChallenge() {
  const issuedAt = Date.now()
  const nonce = randomBytes(16).toString('hex')
  const payload = `${issuedAt}.${nonce}`
  return {
    token: `${payload}.${sign(payload)}`,
    issuedAt,
    expiresInMs: CHALLENGE_MAX_AGE_MS
  }
}

/** Valida assinatura, janela de tempo e idade mínima (anti-bot instantâneo). */
export function verifyContactChallenge(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  const issuedAtRaw = parts[0]
  const nonce = parts[1]
  const signature = parts[2]
  if (!issuedAtRaw || !nonce || !signature) {
    return false
  }
  if (!/^\d+$/.test(issuedAtRaw) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false
  }

  const issuedAt = Number(issuedAtRaw)
  const age = Date.now() - issuedAt
  if (age < CHALLENGE_MIN_AGE_MS || age > CHALLENGE_MAX_AGE_MS) {
    return false
  }

  const expected = sign(`${issuedAtRaw}.${nonce}`)
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

/** Aceita apenas requests same-origin (Origin ou Referer). */
export function assertSameOrigin(event: H3Event) {
  const host = getRequestHeader(event, 'host')
  if (!host) {
    throw createError({ statusCode: 403, statusMessage: 'Origem inválida' })
  }

  const origin = getRequestHeader(event, 'origin')
  const referer = getRequestHeader(event, 'referer')

  const checkUrl = (raw: string) => {
    try {
      return new URL(raw).host === host
    } catch {
      return false
    }
  }

  if (origin) {
    if (!checkUrl(origin)) {
      throw createError({ statusCode: 403, statusMessage: 'Origem inválida' })
    }
    return
  }

  if (referer) {
    if (!checkUrl(referer)) {
      throw createError({ statusCode: 403, statusMessage: 'Origem inválida' })
    }
    return
  }

  // POST cross-site moderno sempre envia Origin; ausência em prod = suspeito.
  if (!import.meta.dev) {
    throw createError({ statusCode: 403, statusMessage: 'Origem inválida' })
  }
}
