import { z } from 'zod'
import { CONTACT_SUBJECTS } from '../constants/contact'

/** Remove caracteres de controle (exceto \n / \t na mensagem). */
function stripControls(value: string, allowMultiline = false) {
  const pattern = allowMultiline
    ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
    : /[\u0000-\u001F\u007F]/g
  return value.replace(pattern, '').trim()
}

const plainText = (min: number, max: number) =>
  z
    .string()
    .transform(value => stripControls(value))
    .pipe(z.string().min(min).max(max))

const messageText = z
  .string()
  .transform(value => stripControls(value, true))
  .pipe(z.string().min(10).max(4000))

/**
 * Payload do formulário de contato.
 * `website` é honeypot — bots preenchem; humanos deixam vazio.
 */
export const contactBodySchema = z.object({
  name: plainText(2, 100),
  email: z
    .string()
    .transform(value => stripControls(value).toLowerCase())
    .pipe(z.email().max(254)),
  company: z
    .string()
    .optional()
    .transform(value => (value ? stripControls(value) : ''))
    .pipe(z.string().max(120)),
  subject: z.enum(CONTACT_SUBJECTS),
  message: messageText,
  /** Honeypot — deve permanecer vazio. */
  website: z.string().max(0).optional().default(''),
  /** Token HMAC emitido por GET /api/contact/challenge */
  challenge: z.string().min(40).max(200)
})

export type ContactBody = z.infer<typeof contactBodySchema>
