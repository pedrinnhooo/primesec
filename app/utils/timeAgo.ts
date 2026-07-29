/** Tempo relativo compacto no locale ativo (ex.: "há 12 min" / "12 min ago"). */
export function useTimeAgo() {
  const { t, locale } = useI18n()

  return (date: string | number | Date) => {
    const languageTag = locale.value === 'en'
      ? 'en-US'
      : locale.value === 'es'
        ? 'es-ES'
        : 'pt-BR'

    const diffMs = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diffMs / 60_000)

    if (minutes < 1) return t('timeAgo.now')
    if (minutes < 60) return t('timeAgo.minutes', { n: minutes })

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t('timeAgo.hours', { n: hours })

    const days = Math.floor(hours / 24)
    if (days < 30) return t('timeAgo.days', { n: days })

    return new Date(date).toLocaleDateString(languageTag, { day: '2-digit', month: 'short' })
  }
}
