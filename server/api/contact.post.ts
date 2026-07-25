import { contactBodySchema } from '#shared/schemas/contact'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)

  const raw = await readBody(event)

  // Honeypot: bots preenchem campos ocultos — responde sucesso sem processar.
  if (typeof raw === 'object' && raw && 'website' in raw) {
    const bait = String((raw as { website?: unknown }).website ?? '')
    if (bait.length > 0) {
      return { ok: true }
    }
  }

  const parsed = contactBodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados do formulário inválidos',
      data: parsed.error.flatten()
    })
  }

  if (!verifyContactChallenge(parsed.data.challenge)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Challenge inválido ou expirado'
    })
  }

  const { name, email, company, subject, message } = parsed.data

  // TODO: integrar com um provedor de e-mail (Resend, SES, Postmark) ou CRM.
  // Por enquanto o lead fica registrado no log do servidor.
  console.info('[contact] Novo lead recebido:', JSON.stringify({
    name,
    email,
    company: company || undefined,
    subject,
    message,
    receivedAt: new Date().toISOString()
  }))

  return { ok: true }
})
