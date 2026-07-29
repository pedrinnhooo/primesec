<script setup lang="ts">
const nuxtApp = useNuxtApp()
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const activeSection = ref<string>()
const scrolled = ref(false)
/** Aberto via toque no hambúrguer (só no topo, em mobile). */
const manualOpen = ref(false)
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

/** Em mobile: menu aberto no scroll ou após toque no hambúrguer. */
const expanded = computed(() => scrolled.value || manualOpen.value)

function onScroll() {
  scrolled.value = window.scrollY > 56
  if (scrolled.value) manualOpen.value = false
}

function toggleMenu() {
  manualOpen.value = !manualOpen.value
}

function closeMenu() {
  manualOpen.value = false
}

function onPointerDown(event: PointerEvent) {
  if (!manualOpen.value || scrolled.value) return
  const target = event.target as Node | null
  if (target && bar.value?.contains(target)) return
  manualOpen.value = false
}

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
        class="flex h-14 items-center justify-between gap-2 rounded-full px-2.5 transition-colors duration-300 sm:h-18 sm:gap-4 sm:px-3 xl:px-4 xl:pr-4"
        :class="scrolled
          ? 'border border-white/10 bg-default/75 shadow-lg shadow-black/20 backdrop-blur'
          : 'border border-transparent bg-transparent'"
      >
        <NuxtLink
          :to="localePath('index')"
          class="primesec-brand-link mt-0.5 shrink-0 sm:mt-1"
          aria-label="PrimeSec"
          @click="closeMenu"
        >
          <AppBrand />
        </NuxtLink>

        <!-- Mobile no topo: hambúrguer. Ao rolar (ou após toque), vira o menu aberto. -->
        <button
          v-show="!expanded"
          type="button"
          class="primesec-burger inline-flex md:hidden"
          :aria-expanded="expanded"
          aria-controls="primesec-primary-nav"
          :aria-label="t('nav.openMenu')"
          @click="toggleMenu"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <nav
          id="primesec-primary-nav"
          class="primesec-nav flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1 lg:gap-2"
          :class="{ 'max-md:hidden': !expanded }"
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
            @click="closeMenu"
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
            @click="closeMenu"
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
    </div>
  </header>
</template>
