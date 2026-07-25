/** Tempo relativo compacto em pt-BR (ex.: "há 12 min"). */
export function timeAgo(date: string | number | Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days} d`

  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
