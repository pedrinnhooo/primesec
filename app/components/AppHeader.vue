<script setup lang="ts">
const nuxtApp = useNuxtApp()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const activeSection = ref<string>()
const scrolled = ref(false)
/** Menu mobile (painel). Desktop usa a nav inline. */
const mobileOpen = ref(false)
const bar = ref<HTMLElement>()

const items = computed(() => [
  {
    label: t('nav.services'),
    to: `${localePath('index')}#features`,
    exactHash: true,
    accent: 'lime' as const,
    active: activeSection.value === 'features'
  },
  {
    label: t('nav.howWeWork'),
    to: `${localePath('index')}#metrics`,
    exactHash: true,
    accent: 'orange' as const,
    active: activeSection.value === 'metrics'
  },
  {
    label: t('nav.blog'),
    to: localePath('blog'),
    accent: 'purple' as const,
    active: route.path.includes('/blog')
  }
])

function onScroll() {
  scrolled.value = window.scrollY > 56
}

function toggleMenu() {
  mobileOpen.value = !mobileOpen.value
}

function closeMenu() {
  mobileOpen.value = false
}

function onPointerDown(event: PointerEvent) {
  if (!mobileOpen.value) return
  const target = event.target as Node | null
  if (target && bar.value?.contains(target)) return
  mobileOpen.value = false
}

watch(() => route.fullPath, closeMenu)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('pointerdown', onPointerDown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('pointerdown', onPointerDown)
})

nuxtApp.hooks.hookOnce('page:loading:end', () => {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.find(e => e.isIntersecting)
    if (visible) {
      activeSection.value = visible.target.id
    } else if (entries.every(e => !e.isIntersecting)) {
      activeSection.value = undefined
    }
  }, { rootMargin: '-50% 0px -50% 0px' })

  document.querySelectorAll('#features, #metrics').forEach(el => observer.observe(el))
})
</script>

<template>
  <header class="pointer-events-none fixed inset-x-0 top-0 z-50">
    <div class="pointer-events-auto mt-3 mx-3 w-[calc(100%-1.5rem)] sm:mt-4 sm:ml-10 sm:mr-6 sm:w-[calc(100%-4rem)] xl:ml-24 xl:mr-16 xl:w-[calc(100%-10rem)]">
      <div
        ref="bar"
        class="relative"
      >
        <div
          class="flex h-14 items-center justify-between gap-2 rounded-full px-2.5 transition-colors duration-300 sm:h-18 sm:gap-4 sm:px-3 xl:px-4 xl:pr-4"
          :class="scrolled || mobileOpen
            ? 'border border-white/10 bg-default/75 shadow-lg shadow-black/20 backdrop-blur'
            : 'border border-transparent bg-transparent'"
        >
          <NuxtLink
            :to="localePath('index')"
            class="primesec-brand-link mt-0.5 shrink-0 sm:mt-1"
            aria-label="SecFocus"
            @click="closeMenu"
          >
            <AppBrand />
          </NuxtLink>

          <button
            type="button"
            class="primesec-burger inline-flex md:hidden"
            :aria-expanded="mobileOpen"
            aria-controls="secfocus-mobile-nav"
            :aria-label="mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')"
            @click="toggleMenu"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <!-- Desktop: links + locale + contato na barra -->
          <nav
            class="primesec-nav hidden min-w-0 items-center gap-0.5 sm:gap-1 md:flex lg:gap-2"
            :aria-label="t('nav.primary')"
          >
            <NuxtLink
              v-for="item in items"
              :key="item.to"
              :to="item.to"
              class="primesec-nav-link"
              :class="[
                `primesec-nav-link--${item.accent}`,
                { 'primesec-nav-link--active': item.active }
              ]"
            >
              <span
                class="primesec-nav-link__signal"
                aria-hidden="true"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>

            <LocaleSwitcher />

            <NuxtLink
              :to="localePath('contato')"
              class="primesec-contact"
            >
              <span
                class="primesec-contact__shine"
                aria-hidden="true"
              />
              <span class="relative z-10">{{ t('nav.contact') }}</span>
              <svg
                class="primesec-contact__icon relative z-10 size-3.5 sm:size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M8.2 3.8 10 7.2a1.2 1.2 0 0 1-.3 1.4L8.4 9.9a10.2 10.2 0 0 0 5.7 5.7l1.3-1.3a1.2 1.2 0 0 1 1.4-.3l3.4 1.8a1.2 1.2 0 0 1 .7 1.3l-.6 2.7a1.2 1.2 0 0 1-1.2 1C10.4 20.4 3.6 13.6 3.2 5a1.2 1.2 0 0 1 1-1.2l2.7-.6a1.2 1.2 0 0 1 1.3.6Z" />
              </svg>
            </NuxtLink>
          </nav>
        </div>

        <!-- Mobile: painel abaixo da barra -->
        <nav
          v-show="mobileOpen"
          id="secfocus-mobile-nav"
          class="primesec-mobile-nav md:hidden"
          :aria-label="t('nav.primary')"
        >
          <NuxtLink
            v-for="item in items"
            :key="`m-${item.to}`"
            :to="item.to"
            class="primesec-nav-link primesec-mobile-nav__link"
            :class="[
              `primesec-nav-link--${item.accent}`,
              { 'primesec-nav-link--active': item.active }
            ]"
            @click="closeMenu"
          >
            <span
              class="primesec-nav-link__signal"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>

          <div class="primesec-mobile-nav__row">
            <LocaleSwitcher />
            <NuxtLink
              :to="localePath('contato')"
              class="primesec-contact flex-1 justify-center"
              @click="closeMenu"
            >
              <span
                class="primesec-contact__shine"
                aria-hidden="true"
              />
              <span class="relative z-10">{{ t('nav.contact') }}</span>
              <svg
                class="primesec-contact__icon relative z-10 size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M8.2 3.8 10 7.2a1.2 1.2 0 0 1-.3 1.4L8.4 9.9a10.2 10.2 0 0 0 5.7 5.7l1.3-1.3a1.2 1.2 0 0 1 1.4-.3l3.4 1.8a1.2 1.2 0 0 1 .7 1.3l-.6 2.7a1.2 1.2 0 0 1-1.2 1C10.4 20.4 3.6 13.6 3.2 5a1.2 1.2 0 0 1 1-1.2l2.7-.6a1.2 1.2 0 0 1 1.3.6Z" />
              </svg>
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>
