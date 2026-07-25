<script setup lang="ts">
const nuxtApp = useNuxtApp()
const route = useRoute()
const activeSection = ref<string>()
const scrolled = ref(false)
/** Aberto via toque no hambúrguer (só no topo, em mobile). */
const manualOpen = ref(false)
const bar = ref<HTMLElement>()

const items = computed(() => [
  {
    label: 'Serviços',
    to: '/#features',
    exactHash: true,
    active: activeSection.value === 'features'
  },
  {
    label: 'Como atuamos',
    to: '/#metrics',
    exactHash: true,
    active: activeSection.value === 'metrics'
  },
  {
    label: 'Blog',
    to: '/blog',
    active: route.path.startsWith('/blog')
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
          to="/"
          class="mt-1 shrink-0 sm:mt-2"
          aria-label="PrimeSec"
          @click="closeMenu"
        >
          <AppLogo class="h-11 w-11 sm:h-14 sm:w-14" />
        </NuxtLink>

        <!-- Mobile no topo: hambúrguer. Ao rolar (ou após toque), vira o menu aberto. -->
        <button
          v-show="!expanded"
          type="button"
          class="primesec-burger inline-flex md:hidden"
          :aria-expanded="expanded"
          aria-controls="primesec-primary-nav"
          aria-label="Abrir menu"
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
          aria-label="Navegação principal"
        >
          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="primesec-nav-link"
            :class="{ 'primesec-nav-link--active': item.active }"
            @click="closeMenu"
          >
            <span
              class="primesec-nav-link__signal"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>

          <NuxtLink
            to="/contato"
            class="primesec-contact"
            @click="closeMenu"
          >
            <span
              class="primesec-contact__shine"
              aria-hidden="true"
            />
            <span class="relative z-10">Contato</span>
            <svg
              class="relative z-10 size-3 sm:size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>
