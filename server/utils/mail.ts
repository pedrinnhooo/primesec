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
  pentest: 'Pentest (Teste de Invasão)',
  'red-blue-purple': 'Red Team / Blue Team / Purple Team',
  lgpd: 'Adequação à LGPD',
  grc: 'GRC e conformidade',
  other: 'Outro assunto'
}

/** Paleta alinhada ao tema dark + lime do site. */
const THEME = {
  bg: '#09090b',
  surface: '#18181b',
  surfaceSoft: '#27272a',
  border: '#3f3f46',
  text: '#fafafa',
  muted: '#a1a1aa',
  dimmed: '#71717a',
  lime: '#c8f031',
  limeSoft: '#a9d316',
  limeDim: 'rgba(200, 240, 49, 0.12)'
} as const

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
    || (import.meta.dev ? 'SecFocus <onboarding@resend.dev>' : '')

  return { apiKey, to, from }
}

function buildContactEmailHtml(payload: ContactMailPayload, subjectLabel: string): string {
  const name = escapeHtml(payload.name)
  const email = escapeHtml(payload.email)
  const company = payload.company ? escapeHtml(payload.company) : ''
  const subject = escapeHtml(subjectLabel)
  const message = escapeHtml(payload.message).replace(/\n/g, '<br />')
  const receivedAt = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short'
  })

  const row = (label: string, value: string, href?: string) => {
    const valueHtml = href
      ? `<a href="${href}" style="color:${THEME.lime};text-decoration:none;">${value}</a>`
      : value
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${THEME.border};vertical-align:top;width:112px;">
          <span style="font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${THEME.dimmed};">${label}</span>
        </td>
        <td style="padding:12px 0 12px 16px;border-bottom:1px solid ${THEME.border};vertical-align:top;">
          <span style="font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.45;color:${THEME.text};">${valueHtml}</span>
        </td>
      </tr>`
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Nova solicitação — SecFocus</title>
</head>
<body style="margin:0;padding:0;background:${THEME.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Nova solicitação de ${name} · ${subject}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${THEME.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${THEME.surface};border:1px solid ${THEME.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${THEME.lime} 0%,${THEME.limeSoft} 55%,transparent 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0 0 10px;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${THEME.lime};">
                secfocus · contact session
              </p>
              <h1 style="margin:0;font-family:'Germania One','Instrument Sans',Georgia,serif;font-size:32px;font-weight:400;letter-spacing:0.02em;line-height:1;color:${THEME.text};">
                SecFocus
              </h1>
              <p style="margin:14px 0 0;font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.5;color:${THEME.muted};">
                Nova solicitação pelo formulário do site.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${THEME.bg};border:1px solid ${THEME.border};border-radius:12px;">
                <tr>
                  <td style="padding:4px 20px 4px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${row('nome', name)}
                      ${row('e-mail', email, `mailto:${email}`)}
                      ${company ? row('empresa', company) : ''}
                      ${row('assunto', subject)}
                      ${row('quando', receivedAt)}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px;">
              <p style="margin:0 0 10px;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${THEME.dimmed};">
                mensagem
              </p>
              <div style="padding:18px 20px;background:${THEME.limeDim};border:1px solid #4f6413;border-radius:12px;font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.65;color:${THEME.text};">
                ${message}
              </div>
              <p style="margin:20px 0 0;font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:${THEME.dimmed};">
                Responda este e-mail para falar direto com <span style="color:${THEME.muted};">${email}</span>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;border-top:1px solid ${THEME.border};background:${THEME.surfaceSoft};">
              <p style="margin:0;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.08em;color:${THEME.dimmed};">
                <a href="https://secfocus.com.br" style="color:${THEME.muted};text-decoration:none;">secfocus.com.br</a>
                &nbsp;·&nbsp; desenvolvimento · segurança · conformidade
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Envia o lead para contato@secfocus.com.br via Resend. */
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
    'Nova solicitação — SecFocus',
    '',
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    payload.company ? `Empresa: ${payload.company}` : null,
    `Assunto: ${subjectLabel}`,
    '',
    payload.message
  ].filter(Boolean).join('\n')

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `[SecFocus] ${subjectLabel} — ${payload.name}`,
    text,
    html: buildContactEmailHtml(payload, subjectLabel)
  })

  if (error) {
    console.error('[contact] Resend falhou', { subject: payload.subject, code: error.name })
    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível enviar a mensagem agora'
    })
  }
}
