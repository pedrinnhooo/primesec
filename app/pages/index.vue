<script lang="ts">
/**
 * Escopo de módulo (roda uma vez por carregamento de página, ao contrário do
 * corpo de `<script setup>`): a tela de carregamento pertence à primeira
 * pintura do site, não a cada volta para a home.
 */
let introDone = false
</script>

<script setup lang="ts">
definePageMeta({
  colorMode: 'dark'
})

defineRouteRules({
  prerender: true
})

const page = useHomeContent()

const title = computed(() => page.value.seo.title || page.value.title.replace(/\n/g, ' '))
const description = computed(() => page.value.seo.description || page.value.description)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const heroTitle = computed(() => {
  const [primary = '', ...secondaryParts] = (page.value.title ?? '').split('\n')

  return {
    primary,
    secondary: secondaryParts.join(' ').trim()
  }
})

/** Teto de segurança: sem WebGL ou em GPU lenta o site é revelado de todo jeito. */
const REVEAL_TIMEOUT_MS = 9000

const globeProgress = ref(0)
// Placeholder CSS do globo fica visível até o WebGL renderizar o 1º frame.
const globeReady = ref(false)
const fontsReady = ref(false)
const revealed = ref(introDone)

/** Trava a barra em 100% no instante em que a revelação é decidida. */
const complete = ref(false)

// As fontes valem uma fatia pequena: a montagem do globo domina o tempo de carga.
const progress = computed(() => complete.value
  ? 1
  : globeProgress.value * 0.92 + (fontsReady.value ? 0.08 : 0))

/** Tempo com a barra em 100% antes do crossfade começar. */
const COMPLETE_PAINT_MS = 180

/**
 * Teto se o evento `done` do loader falhar: ~100 ticks de 30ms + folga.
 * O overlay NÃO deve sumir antes da contagem 0→100 terminar.
 */
const COUNTUP_SAFETY_MS = 8000

let timeout: ReturnType<typeof setTimeout> | undefined
let paintTimeout: ReturnType<typeof setTimeout> | undefined

function reveal() {
  if (revealed.value || complete.value) return
  clearTimeout(timeout)
  introDone = true
  // Marca progresso real como completo; a % na tela continua contando
  // até 100 e só então emite `done`.
  complete.value = true
  paintTimeout = setTimeout(() => {
    revealed.value = true
  }, COUNTUP_SAFETY_MS)
}

function onLoaderDone() {
  if (revealed.value) return
  clearTimeout(paintTimeout)
  paintTimeout = setTimeout(() => {
    revealed.value = true
  }, COMPLETE_PAINT_MS)
}

watch([globeReady, fontsReady], ([globe, fonts]) => {
  if (globe && fonts) reveal()
})

onMounted(() => {
  if (revealed.value) return

  timeout = setTimeout(reveal, REVEAL_TIMEOUT_MS)

  // Espera o webfont para o hero não trocar de tipografia logo após a revelação.
  const markFonts = () => {
    fontsReady.value = true
  }
  const fonts = document.fonts?.ready ?? Promise.resolve()
  fonts.then(markFonts).catch(markFonts)
})

onBeforeUnmount(() => {
  clearTimeout(timeout)
  clearTimeout(paintTimeout)
})

useHead({
  link: [
    // Maior download da cena: viaja em paralelo com o chunk do Three.js.
    // `crossorigin` alinha o modo de credenciais do preload com o do fetch().
    { rel: 'preload', as: 'fetch', crossorigin: 'anonymous', href: '/data/country-lines.bin' }
  ]
})
</script>

<template>
  <div
    class="relative"
    :class="{ 'primesec-hold': !revealed }"
  >
    <Transition name="globe-loader">
      <GlobeLoader
        v-if="!revealed"
        :progress="progress"
        @done="onLoaderDone"
      />
    </Transition>

    <!-- Full-bleed cyber threat globe + galáxia fluida (sem attacks) -->
    <div
      class="absolute inset-x-0 top-0 z-0 h-[min(100vh,56rem)] overflow-hidden"
      style="-webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%);"
    >
      <!-- Galáxia verde fluida atrás do globo — sem linhas de attack (só no CTA/Home). -->
      <LazyGalaxyBanner
        class="pointer-events-none absolute inset-0"
        palette="green"
        density="medium"
        :attacks="false"
        hydrate-on-idle
      />
      <!-- Globo estático (SSR): aparece junto com o site e some em crossfade -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 -bottom-[10%] flex items-center justify-center transition-opacity duration-500 ease-out"
        :class="globeReady ? 'opacity-0' : 'opacity-100'"
        aria-hidden="true"
      >
        <div
          class="aspect-square h-[86%] rounded-full"
          style="
            background: radial-gradient(circle at 38% 32%, #0c130c 0%, #070a07 48%, #040504 78%, #020302 100%);
            box-shadow:
              inset 0 0 90px rgba(42, 219, 160, 0.14),
              inset 0 0 24px rgba(163, 230, 53, 0.08),
              0 0 120px rgba(42, 219, 160, 0.10);
          "
        />
      </div>
      <!-- Monta junto com a hidratação: a tela de carregamento cobre a cena
           até ela estar inteira pronta. -->
      <LazyCyberGlobe
        class="absolute inset-x-0 top-0 -bottom-[10%]"
        @progress="globeProgress = $event"
        @ready="globeReady = true"
      />
      <GradientGlow class="pointer-events-none top-0 w-2/3 h-1/2 opacity-40" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-56 sm:h-72 bg-linear-to-t from-(--ui-bg) from-5% via-(--ui-bg)/70 via-45% to-transparent" />
      <div
        class="primesec-enter absolute left-4 xl:left-8 top-[54%] -translate-y-1/2 hidden xl:block"
        style="--enter-delay: 1.1s"
      >
        <LazyCyberGlobeDashboard hydrate-on-media-query="(min-width: 1280px)" />
      </div>
    </div>

    <!-- Hero -->
    <UPageHero
      :ui="{
        root: 'relative z-10 pb-12 sm:pb-16 pt-20 pointer-events-none',
        container: 'relative z-10 lg:py-20',
        wrapper: 'flex flex-col items-center',
        title: 'sm:text-6xl lg:text-7xl xl:text-[80px] tracking-tighter leading-[1.05]',
        description: 'mt-5 max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-default',
        links: 'gap-3'
      }"
    >
      <template #headline>
        <div
          class="primesec-enter"
          style="--enter-delay: 0.2s"
        >
          <UBadge
            color="neutral"
            variant="soft"
            :label="page.hero.headline"
            class="rounded-full px-3 py-1.5 gap-1.5 bg-white/5 backdrop-blur"
          >
            <template #leading>
              <UChip
                inset
                standalone
                :ui="{ base: 'animate-pulse ring-0' }"
              />
            </template>
          </UBadge>
        </div>
      </template>

      <template #title>
        <span
          class="primesec-enter inline-block"
          style="--enter-delay: 0.35s"
        >
          {{ heroTitle.primary }}
          <br v-if="heroTitle.secondary">
          <span
            v-if="heroTitle.secondary"
            class="animate-shimmer bg-size-[200%_auto] bg-clip-text text-transparent"
            :style="{
              backgroundImage: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-300), var(--color-primary-200), var(--color-primary-100), var(--color-primary-200), var(--color-primary-300), var(--color-primary-400))',
              animationDuration: '10s'
            }"
          >
            {{ heroTitle.secondary }}
          </span>
        </span>
      </template>

      <template #description>
        <span
          class="primesec-enter inline-block"
          style="--enter-delay: 0.5s"
        >
          {{ page.description }}
        </span>
      </template>

      <template #links>
        <div
          class="primesec-enter flex flex-wrap justify-center gap-6 pointer-events-auto"
          style="--enter-delay: 0.65s"
        >
          <UButton
            v-for="link in page.hero.links"
            :key="link.label"
            v-bind="link"
          />
        </div>
      </template>

      <div
        class="primesec-enter max-w-2xl mx-auto w-full pointer-events-auto -mt-6 sm:-mt-10"
        style="--enter-delay: 0.85s"
      >
        <HeroTerminal :lines="page.terminal.lines" />
      </div>

      <div
        class="primesec-enter relative z-20 max-w-7xl mx-auto w-full pointer-events-auto mt-2 sm:mt-4 overflow-visible"
        style="--enter-delay: 0.95s"
      >
        <HomeStackLogos
          :title="page.logos.title"
          :groups="page.logos.groups"
        />
      </div>
    </UPageHero>

    <!-- Below-fold: Motion só carrega quando a seção entra na viewport. -->
    <LazyHomeFeatures
      :headline="page.features.headline"
      :title="page.features.title"
      :description="page.features.description"
      :items="page.features.items"
      :hydrate-on-visible="{ rootMargin: '200px' }"
    />

    <LazyHomeMetrics
      :headline="page.metrics.headline"
      :title="page.metrics.title"
      :description="page.metrics.description"
      :items="page.metrics.items"
      :hydrate-on-visible="{ rootMargin: '200px' }"
    />

    <LazyHomeCta
      :title="page.cta.title"
      :description="page.cta.description"
      :command="page.cta.command"
      :links="page.cta.links"
      :hydrate-on-visible="{ rootMargin: '200px' }"
    />
  </div>
</template>
