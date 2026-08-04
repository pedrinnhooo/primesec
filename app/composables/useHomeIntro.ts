/**
 * Intro/loader da home: 1ª visita mostra o GlobeLoader;
 * visitas seguintes (SPA ou reload) pulam direto para o conteúdo.
 *
 * - `useState` — compartilha na sessão SPA (voltar pelo logo)
 * - `useCookie` — persiste entre reloads (SSR-friendly, docs Nuxt)
 *
 * Um script cedo em `app.vue` lê o cookie e marca `html.secfocus-intro-seen`
 * para esconder o loader e manter o scroll livre antes da hidratação.
 *
 * Scroll lock: CSS `html:has(#globe-loader):not(.secfocus-intro-seen)`.
 * A classe DOM só entra no dismiss (1ª visita) ou se o cookie já existia.
 */
export function useHomeIntro() {
  const COOKIE = 'secfocus-intro'
  /** 30 dias — sliding: regrava ao marcar de novo. */
  const MAX_AGE = 60 * 60 * 24 * 30

  const seenCookie = useCookie<boolean>(COOKIE, {
    default: () => false,
    maxAge: MAX_AGE,
    sameSite: 'lax',
    path: '/',
    watch: false
  })

  const seenState = useState<boolean>('secfocus-intro-seen', () => false)

  /** Já viu a intro nesta sessão ou em visita anterior (cookie). */
  const hasSeenIntro = computed(
    () => seenState.value === true || seenCookie.value === true
  )

  /** Persiste cookie/state — não mexe no scroll ainda. */
  function markIntroSeen() {
    seenState.value = true
    seenCookie.value = true
  }

  /**
   * Libera scroll + esconde loader via CSS.
   * Chamar no dismiss da intro ou ao sincronizar visita em cache.
   */
  function applyIntroSeenDom() {
    if (!import.meta.client) return
    const html = document.documentElement
    html.classList.add('secfocus-intro-seen')
    html.classList.remove('overflow-hidden', 'secfocus-scroll-lock')
  }

  function syncDomClass() {
    if (!import.meta.client) return
    if (hasSeenIntro.value) applyIntroSeenDom()
  }

  return {
    COOKIE,
    hasSeenIntro,
    markIntroSeen,
    applyIntroSeenDom,
    syncDomClass
  }
}
