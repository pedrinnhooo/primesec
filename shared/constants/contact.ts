/** Chaves estáveis do assunto — labels vêm do i18n. */
export const CONTACT_SUBJECTS = [
  'software',
  'pentest',
  'red-blue-purple',
  'lgpd',
  'grc',
  'other'
] as const

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]

export const CONTACT_EMAIL = 'contato@secfocus.com.br'
