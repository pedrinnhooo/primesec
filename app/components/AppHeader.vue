<script setup lang="ts">
const nuxtApp = useNuxtApp()
const route = useRoute()
const activeSection = ref<string>()
const scrolled = ref(false)
const menuOpen = ref(false)
const mobileOpen = ref(false)

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

const showBar = computed(() => !scrolled.value || menuOpen.value)
const showFab = computed(() => scrolled.value && !menuOpen.value)

function onScroll() {
  const next = window.scrollY > 56
  scrolled.value = next
  if (!next) {
    menuOpen.value = false
    mobileOpen.value = false
  }
}

function openMenu() {
  menuOpen.value = true
  // Mobile: abre já expandido, sem passo intermediário.
  mobileOpen.value = true
}

function closeMenu() {
  menuOpen.value = false
  mobileOpen.value = false
}

function onNavClick() {
  if (scrolled.value) {
    closeMenu()
    return
  }
  mobileOpen.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
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
    <Transition name="nav-fade">
      <div
        v-if="showBar"
        class="pointer-events-auto mt-4 ml-10 mr-6 w-[calc(100%-4rem)] sm:ml-14 sm:mr-10 sm:w-[calc(100%-6rem)] xl:ml-24 xl:mr-16 xl:w-[calc(100%-10rem)]"
      >
        <div
          class="flex h-18 items-center justify-between gap-4 rounded-full px-3 transition-colors duration-300 sm:px-4 xl:pr-4"
          :class="scrolled
            ? 'border border-white/10 bg-default/75 shadow-lg shadow-black/20 backdrop-blur'
            : 'border border-transparent bg-transparent'"
        >
          <NuxtLink
            to="/"
            class="mt-1.5 shrink-0 sm:mt-2"
            aria-label="PrimeSec"
            @click="onNavClick"
          >
            <AppLogo class="h-12 w-12 sm:h-14 sm:w-14" />
          </NuxtLink>

          <nav
            class="hidden items-center gap-2 lg:flex"
            aria-label="Navegação principal"
          >
            <NuxtLink
              v-for="item in items"
              :key="item.to"
              :to="item.to"
              class="primesec-nav-link"
              :class="{ 'primesec-nav-link--active': item.active }"
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
              @click="onNavClick"
            >
              <span
                class="primesec-contact__shine"
                aria-hidden="true"
              />
              <span class="relative z-10">Contato</span>
              <svg
                class="relative z-10 size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </NuxtLink>
            <UButton
              v-if="scrolled"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              square
              aria-label="Fechar menu"
              @click="closeMenu"
            />
          </nav>

          <div class="flex items-center gap-1 lg:hidden">
            <!-- Scroll: só o X volta ao FAB. Topo: hamburger abre o drawer. -->
            <UButton
              v-if="scrolled"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              square
              aria-label="Fechar menu"
              @click="closeMenu"
            />
            <UButton
              v-else
              size="sm"
              variant="ghost"
              color="neutral"
              square
              :aria-label="mobileOpen ? 'Fechar navegação' : 'Abrir navegação'"
              :aria-expanded="mobileOpen"
              @click="mobileOpen = !mobileOpen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-5"
                :class="{ 'primesec-burger--open': mobileOpen }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line
                  class="primesec-burger__line primesec-burger__line--top"
                  x1="4"
                  y1="6"
                  x2="20"
                  y2="6"
                />
                <line
                  class="primesec-burger__line primesec-burger__line--mid"
                  x1="4"
                  y1="12"
                  x2="20"
                  y2="12"
                />
                <line
                  class="primesec-burger__line primesec-burger__line--bot"
                  x1="4"
                  y1="18"
                  x2="20"
                  y2="18"
                />
              </svg>
            </UButton>
          </div>
        </div>

        <div
          v-if="mobileOpen"
          class="mt-2 rounded-2xl border border-white/10 bg-default/90 p-4 backdrop-blur lg:hidden"
        >
          <UNavigationMenu
            :items="items"
            orientation="vertical"
            @click="onNavClick"
          />
          <UButton
            class="mt-4"
            label="Contato"
            block
            to="/contato"
            @click="onNavClick"
          />
        </div>
      </div>
    </Transition>
  </header>

  <Teleport to="body">
    <button
      v-if="showFab"
      type="button"
      class="primesec-fab primesec-fab--enter flex size-14 items-center justify-center rounded-full"
      aria-label="Abrir menu PrimeSec"
      @click="openMenu"
    >
      <AppLogo class="h-8 w-8" />
    </button>
  </Teleport>
</template>
