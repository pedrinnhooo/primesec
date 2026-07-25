import { queryCollection } from '@nuxt/content/server'

/**
 * Conteúdo da home (content/index.yml) servido pelo Nitro.
 *
 * A consulta fica no servidor de propósito: chamar `queryCollection` no cliente
 * faria o @nuxt/content baixar o SQLite em WebAssembly (~1 MB) só para ler um
 * único YAML estático.
 */
export default defineEventHandler(async (event) => {
  const page = await queryCollection(event, 'content').first()

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Conteúdo da home não encontrado' })
  }

  return page
})
