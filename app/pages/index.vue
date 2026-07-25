<script setup lang="ts">
definePageMeta({
  colorMode: 'dark'
})

defineRouteRules({
  prerender: true
})

const { data: page } = await useAsyncData('index', () => queryCollection('content').first(), {
  // Conteúdo da home é estático: hidrata direto do payload SSR/prerender.
  deep: false
})
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const heroTitle = computed(() => {
  const [primary = '', ...secondaryParts] = (page.value?.title ?? '').split('\n')

  return {
    primary,
    secondary: secondaryParts.join(' ').trim()
  }
})

// Placeholder CSS do globo fica visível até o WebGL renderizar o 1º frame.
const globeReady = ref(false)
/** Three.js só monta depois do hero pintar (~2s + idle). */
const mountGlobe = ref(false)

onMounted(() => {
  const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
  const idle = () => new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve(), { timeout: 2500 })
    } else {
      setTimeout(resolve, 400)
    }
  })

  Promise.all([wait(2000), idle()]).then(() => {
    mountGlobe.value = true
  })
})
</script>

<template>
  <div
    v-if="page"
    class="relative"
  >
    <!-- Full-bleed cyber threat globe behind hero + header area -->
    <div class="absolute inset-x-0 top-0 z-0 h-[min(100vh,56rem)] overflow-hidden">
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
      <!-- Three.js: só baixa/executa depois do load crítico. -->
      <LazyCyberGlobe
        v-if="mountGlobe"
        class="absolute inset-x-0 top-0 -bottom-[10%]"
        @ready="globeReady = true"
      />
      <GradientGlow class="top-0 w-2/3 h-1/2" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-(--ui-bg) to-transparent" />
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
        class="primesec-enter max-w-2xl mx-auto w-full pointer-events-auto mt-2 sm:mt-4"
        style="--enter-delay: 0.95s"
      >
        <UPageLogos
          :title="page.logos.title"
          :items="page.logos.items"
          :ui="{
            title: 'font-mono uppercase text-sm tracking-[0.14em] text-dimmed mb-5',
            logos: 'gap-x-8 gap-y-4',
            logo: 'text-muted size-9 sm:size-10'
          }"
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
