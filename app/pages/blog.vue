<script setup lang="ts">
import type { NewsCategory, NewsFeed, NewsTopic } from '#shared/types/news'
import { CONTACT_EMAIL } from '#shared/constants/contact'

definePageMeta({
  colorMode: 'dark'
})

defineRouteRules({
  prerender: true
})

const { t, locale } = useI18n()
const localePath = useLocalePath()

const title = computed(() => t('blog.seo.title'))
const description = computed(() => t('blog.seo.description'))

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const ctaCommand = CONTACT_EMAIL

const newsLang = computed(() => {
  if (locale.value === 'en' || locale.value === 'es') return locale.value
  return 'pt'
})

// Fetch só no client: a página é prerenderizada como casca estática
// e o feed hidrata "ao vivo" no navegador — idioma acompanha o locale.
const { data: feed, status, error, refresh } = await useFetch<NewsFeed>('/api/news', {
  server: false,
  lazy: true,
  query: { lang: newsLang },
  watch: [newsLang]
})

watch(newsLang, () => {
  syncedAt.value = null
  activeFilter.value = 'todas'
  activeTopic.value = 'todos'
})

const toast = useToast()

// Horário local da última sincronização bem-sucedida (não o updatedAt
// congelado no cache do Nitro — assim o label muda a cada refresh).
const syncedAt = ref<Date | null>(null)
const refreshing = ref(false)

// Feedback do botão de sync: loading fica visível mesmo em resposta rápida;
// success dá confirmação quando o horário quase não muda o suficiente pra notar.
type RefreshFeedback = 'idle' | 'loading' | 'success'
const refreshFeedback = ref<RefreshFeedback>('idle')
let refreshSuccessTimer: ReturnType<typeof setTimeout> | null = null

watch(status, (value) => {
  if (value === 'success' && feed.value && !syncedAt.value) {
    syncedAt.value = new Date()
  }
})

// Alinha com /api/news no nuxt-security: 8 tokens / 5 min.
// Client guarda margem para o intervalo automático (~2–3 hits) e
// corta spam de clique manual antes de estourar o 429 no servidor.
const NEWS_RATE_WINDOW_MS = 300_000
const NEWS_MANUAL_LIMIT = 5
const NEWS_POLL_MS = 120_000
const MANUAL_LOADING_MIN_MS = 400
const MANUAL_SUCCESS_MS = 1400
const manualRefreshAt = ref<number[]>([])

function showRefreshLimitToast() {
  toast.add({
    title: t('blog.rateLimitTitle'),
    description: t('blog.rateLimitDescription'),
    icon: 'i-lucide-alert-triangle',
    color: 'warning'
  })
}

function isRateLimitedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const statusCode = 'statusCode' in err ? Number(err.statusCode) : NaN
  const statusCodeAlt = 'status' in err ? Number(err.status) : NaN
  return statusCode === 429 || statusCodeAlt === 429
}

function pruneManualRefreshes(now = Date.now()) {
  manualRefreshAt.value = manualRefreshAt.value.filter(at => now - at < NEWS_RATE_WINDOW_MS)
}

function clearRefreshSuccessTimer() {
  if (refreshSuccessTimer) {
    clearTimeout(refreshSuccessTimer)
    refreshSuccessTimer = null
  }
}

function showRefreshSuccess() {
  clearRefreshSuccessTimer()
  refreshFeedback.value = 'success'
  refreshSuccessTimer = setTimeout(() => {
    refreshFeedback.value = 'idle'
    refreshSuccessTimer = null
  }, MANUAL_SUCCESS_MS)
}

onBeforeUnmount(() => {
  clearRefreshSuccessTimer()
})

async function refreshFeed(manual = false) {
  // Evita requisições concorrentes (botão + intervalo + retry).
  if (status.value === 'pending' || refreshing.value) return

  if (manual) {
    const now = Date.now()
    pruneManualRefreshes(now)
    if (manualRefreshAt.value.length >= NEWS_MANUAL_LIMIT) {
      showRefreshLimitToast()
      return
    }
    manualRefreshAt.value.push(now)
    clearRefreshSuccessTimer()
    refreshFeedback.value = 'loading'
  }

  refreshing.value = true
  const startedAt = Date.now()
  try {
    // Manual: ?fresh=1 bypassa o cache Nitro e regenera o feed.
    // Auto (2 min): usa cache até expirar (maxAge 120s), aí vem fresco.
    if (manual) {
      const next = await $fetch<NewsFeed>('/api/news', {
        query: { fresh: '1', lang: newsLang.value }
      })
      feed.value = next
      error.value = undefined
    } else {
      await refresh()
    }
    syncedAt.value = new Date()

    if (manual) {
      const elapsed = Date.now() - startedAt
      if (elapsed < MANUAL_LOADING_MIN_MS) {
        await new Promise(resolve => setTimeout(resolve, MANUAL_LOADING_MIN_MS - elapsed))
      }
      showRefreshSuccess()
    }
  } catch (err) {
    if (manual) refreshFeedback.value = 'idle'
    if (manual && isRateLimitedError(err)) {
      showRefreshLimitToast()
    }
  } finally {
    refreshing.value = false
  }
}

// Poll a cada 2 min — alinhado ao maxAge do /api/news.
useIntervalFn(() => {
  refreshFeed(false)
}, NEWS_POLL_MS)

const loading = computed(() => (status.value === 'pending' || refreshing.value) && !feed.value)
const isRefreshing = computed(() => status.value === 'pending' || refreshing.value)
const isRefreshButtonLoading = computed(() =>
  refreshFeedback.value === 'loading' || (isRefreshing.value && refreshFeedback.value !== 'success')
)
const refreshButtonIcon = computed(() =>
  refreshFeedback.value === 'success' ? 'i-lucide-check' : 'i-lucide-refresh-cw'
)
const refreshButtonLabel = computed(() => {
  if (refreshFeedback.value === 'loading' || isRefreshButtonLoading.value) return t('blog.refreshing')
  if (refreshFeedback.value === 'success') return t('blog.refreshed')
  return t('blog.refresh')
})

type Filter = 'todas' | NewsCategory
type TopicFilter = 'todos' | NewsTopic

const filters = computed(() => [
  { value: 'todas' as const, label: t('blog.filters.all'), icon: 'i-lucide-newspaper' },
  { value: 'tecnologia' as const, label: t('blog.filters.tech'), icon: 'i-lucide-cpu' },
  { value: 'ciberseguranca' as const, label: t('blog.filters.cyber'), icon: 'i-lucide-shield' }
])

const techTopics = computed(() => [
  { value: 'todos' as const, label: t('blog.filters.topicsAll'), icon: 'i-lucide-layout-grid' },
  { value: 'geral' as const, label: t('topics.geral'), icon: 'i-lucide-layers' },
  { value: 'ia' as const, label: t('topics.ia'), icon: 'i-lucide-sparkles' },
  { value: 'uiux' as const, label: t('topics.uiux'), icon: 'i-lucide-palette' },
  { value: 'frontend' as const, label: t('topics.frontend'), icon: 'i-lucide-panel-top' },
  { value: 'backend' as const, label: t('topics.backend'), icon: 'i-lucide-server' },
  { value: 'database' as const, label: t('topics.database'), icon: 'i-lucide-database' }
])

const cyberTopics = computed(() => [
  { value: 'todos' as const, label: t('blog.filters.topicsAll'), icon: 'i-lucide-layout-grid' },
  { value: 'ia' as const, label: t('topics.ia'), icon: 'i-lucide-sparkles' },
  { value: 'redteam' as const, label: t('topics.redteam'), icon: 'i-lucide-swords' },
  { value: 'blueteam' as const, label: t('topics.blueteam'), icon: 'i-lucide-shield-check' },
  { value: 'purpleteam' as const, label: t('topics.purpleteam'), icon: 'i-lucide-blend' },
  { value: 'lgpd-grc' as const, label: t('topics.lgpd-grc'), icon: 'i-lucide-scale' }
])

const activeFilter = ref<Filter>('todas')
const activeTopic = ref<TopicFilter>('todos')

const topicFilters = computed(() => {
  if (activeFilter.value === 'tecnologia') return techTopics.value
  if (activeFilter.value === 'ciberseguranca') return cyberTopics.value
  return []
})

watch(activeFilter, () => {
  activeTopic.value = 'todos'
})

const items = computed(() => {
  const all = feed.value?.items ?? []
  const byCategory = activeFilter.value === 'todas'
    ? all
    : all.filter(item => item.category === activeFilter.value)

  if (activeTopic.value === 'todos') return byCategory
  return byCategory.filter(item => item.topic === activeTopic.value)
})

const languageTag = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const updatedLabel = computed(() => {
  if (!syncedAt.value) return ''
  return syncedAt.value.toLocaleTimeString(languageTag.value, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const ctaLinks = computed(() => [{
  label: t('blog.cta.link'),
  color: 'primary',
  to: localePath('contato')
}])
</script>

<template>
  <div class="relative">
    <!-- Galáxia + attacks (mesma linguagem visual do globo da Home) -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(72vh,40rem)] overflow-hidden"
      style="-webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%);"
    >
      <LazyGalaxyBanner
        class="absolute inset-0"
        palette="green"
        density="medium"
        hydrate-on-idle
      />
      <GradientGlow class="top-0 w-3/4 h-[55%] opacity-40" />
      <div class="absolute inset-x-0 bottom-0 h-56 sm:h-72 bg-linear-to-t from-(--ui-bg) from-5% via-(--ui-bg)/70 via-45% to-transparent" />
    </div>

    <UPageSection
      :ui="{
        root: 'relative z-10 pt-20 pb-16 sm:pt-10 sm:pb-24',
        container: 'max-w-6xl'
      }"
    >
      <!-- Cabeçalho -->
      <div class="flex flex-col items-center text-center">
        <div
          class="primesec-enter"
          style="--enter-delay: 0.1s"
        >
          <UBadge
            color="neutral"
            variant="soft"
            :label="t('blog.badge')"
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

        <h1
          class="primesec-enter mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] text-highlighted"
          style="--enter-delay: 0.25s"
        >
          {{ t('blog.titlePrimary') }}
          <br>
          <span
            class="animate-shimmer bg-size-[200%_auto] bg-clip-text text-transparent"
            :style="{
              backgroundImage: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-300), var(--color-primary-200), var(--color-primary-100), var(--color-primary-200), var(--color-primary-300), var(--color-primary-400))',
              animationDuration: '10s'
            }"
          >
            {{ t('blog.titleSecondary') }}
          </span>
        </h1>

        <p
          class="primesec-enter mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-dimmed"
          style="--enter-delay: 0.4s"
        >
          {{ t('blog.description') }}
        </p>
      </div>

      <!-- Controles -->
      <div
        class="primesec-enter mt-12 flex flex-col items-center gap-5"
        style="--enter-delay: 0.55s"
      >
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <UButton
            v-for="filter in filters"
            :key="filter.value"
            :label="filter.label"
            :icon="filter.icon"
            :color="activeFilter === filter.value ? 'primary' : 'neutral'"
            :variant="activeFilter === filter.value ? 'soft' : 'ghost'"
            size="sm"
            class="rounded-full"
            :ui="{
              base: 'justify-center'
            }"
            @click="activeFilter = filter.value"
          />
        </div>

        <div
          v-if="topicFilters.length"
          class="flex flex-wrap items-center justify-center gap-1.5"
        >
          <UButton
            v-for="topic in topicFilters"
            :key="topic.value"
            :label="topic.label"
            :icon="topic.icon"
            :color="activeTopic === topic.value ? 'primary' : 'neutral'"
            :variant="activeTopic === topic.value ? 'subtle' : 'ghost'"
            size="xs"
            class="rounded-full"
            :ui="{
              base: 'justify-center'
            }"
            @click="activeTopic = topic.value"
          />
        </div>

        <div class="flex h-8 items-center gap-3">
          <span
            v-if="updatedLabel"
            class="font-mono text-xs leading-none text-dimmed"
          >
            {{ t('blog.updatedAt', { time: updatedLabel }) }}
          </span>
          <UButton
            :icon="refreshButtonIcon"
            :color="refreshFeedback === 'success' ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
            square
            :aria-label="refreshButtonLabel"
            :loading="isRefreshButtonLoading"
            :disabled="isRefreshButtonLoading"
            @click="refreshFeed(true)"
          />
        </div>
      </div>

      <!-- Feed -->
      <div class="mt-6 overflow-hidden rounded-2xl border border-default bg-default">
        <!-- Carregando -->
        <div
          v-if="loading"
          class="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="n in 9"
            :key="n"
            class="flex flex-col gap-3 bg-default p-5"
          >
            <div class="flex items-center justify-between">
              <USkeleton class="h-5 w-24 rounded-full" />
              <USkeleton class="h-4 w-14" />
            </div>
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-4/5" />
            <USkeleton class="mt-auto h-4 w-2/3" />
          </div>
        </div>

        <!-- Erro -->
        <div
          v-else-if="error && !items.length"
          class="flex flex-col items-center gap-4 px-6 py-16 text-center"
        >
          <UIcon
            name="i-lucide-satellite-dish"
            class="size-8 text-dimmed"
          />
          <p class="max-w-sm text-sm leading-relaxed text-dimmed">
            {{ t('blog.error') }}
          </p>
          <UButton
            :label="t('blog.retry')"
            color="primary"
            variant="soft"
            icon="i-lucide-refresh-cw"
            :loading="isRefreshing"
            @click="refreshFeed(true)"
          />
        </div>

        <!-- Lista vazia (filtro) -->
        <div
          v-else-if="!items.length"
          class="flex flex-col items-center gap-3 px-6 py-16 text-center"
        >
          <UIcon
            name="i-lucide-filter-x"
            class="size-8 text-dimmed"
          />
          <p class="max-w-sm text-sm leading-relaxed text-dimmed">
            {{ t('blog.empty') }}
          </p>
        </div>

        <!-- Lista -->
        <div
          v-else
          class="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3"
        >
          <template
            v-for="(item, index) in items"
            :key="item.id"
          >
            <BlogNewsCard
              v-if="index < 3"
              :item="item"
              class="h-full"
            />
            <ScrollReveal
              v-else
              class="h-full"
              variant="fade"
              :delay="Math.min(index - 3, 8) * 0.08"
            >
              <BlogNewsCard :item="item" />
            </ScrollReveal>
          </template>
        </div>
      </div>

      <p class="mt-4 mx-auto max-w-3xl text-center font-mono text-xs leading-relaxed text-dimmed">
        {{ t('blog.sources') }}
      </p>
    </UPageSection>

    <LazyHomeCta
      :title="t('blog.cta.title')"
      :description="t('blog.cta.description')"
      :command="ctaCommand"
      :links="ctaLinks"
      :hydrate-on-visible="{ rootMargin: '200px' }"
    />
  </div>
</template>
