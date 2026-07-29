import { createHash } from 'node:crypto'
import { Resend } from 'resend'
import { CONTACT_EMAIL, type ContactSubject } from '#shared/constants/contact'

export interface ContactMailPayload {
  name: string
  email: string
  company: string
  subject: ContactSubject
  message: string
}

const SUBJECT_LABELS: Record<ContactSubject, string> = {
  software: 'Desenvolvimento de software',
  pentest: 'Pentest / VAPT',
  'red-blue-purple': 'Red / Blue / Purple Team',
  lgpd: 'LGPD',
  grc: 'GRC',
  other: 'Outro'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Hash truncado só para log (sem PII legível). */
export function emailFingerprint(email: string): string {
  return createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 10)
}

function resolveMailConfig() {
  const config = useRuntimeConfig()
  const apiKey = typeof config.resendApiKey === 'string' ? config.resendApiKey.trim() : ''
  const to = (typeof config.contactToEmail === 'string' && config.contactToEmail.trim())
    || CONTACT_EMAIL
  const from = (typeof config.contactFromEmail === 'string' && config.contactFromEmail.trim())
    || (import.meta.dev ? 'PrimeSec <onboarding@resend.dev>' : '')

  return { apiKey, to, from }
}

/** Envia o lead para priimesec@gmail.com via Resend. */
export async function sendContactMail(payload: ContactMailPayload): Promise<void> {
  const { apiKey, to, from } = resolveMailConfig()

  if (!apiKey) {
    if (import.meta.dev) {
      console.info('[contact] Resend não configurado — lead aceito em dev', {
        subject: payload.subject,
        emailFp: emailFingerprint(payload.email)
      })
      return
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Serviço de e-mail não configurado'
    })
  }

  if (!from) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Remetente de e-mail não configurado'
    })
  }

  const subjectLabel = SUBJECT_LABELS[payload.subject] ?? payload.subject
  const text = [
    `Novo lead — PrimeSec`,
    ``,
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    payload.company ? `Empresa: ${payload.company}` : null,
    `Assunto: ${subjectLabel}`,
    ``,
    payload.message
  ].filter(Boolean).join('\n')

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
      <h2 style="margin:0 0 12px">Novo lead — PrimeSec</h2>
      <p><strong>Nome:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(payload.email)}</p>
      ${payload.company ? `<p><strong>Empresa:</strong> ${escapeHtml(payload.company)}</p>` : ''}
      <p><strong>Assunto:</strong> ${escapeHtml(subjectLabel)}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
      <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
    </div>
  `.trim()

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `[PrimeSec] ${subjectLabel} — ${payload.name}`,
    text,
    html
  })

  if (error) {
    console.error('[contact] Resend falhou', { subject: payload.subject, code: error.name })
    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível enviar a mensagem agora'
    })
  }
}
