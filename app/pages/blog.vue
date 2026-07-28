<script setup lang="ts">
import type { NewsCategory, NewsFeed } from '#shared/types/news'

definePageMeta({
  colorMode: 'dark'
})

defineRouteRules({
  prerender: true
})

const title = 'Blog: Notícias de tecnologia e cibersegurança'
const description = 'Radar em tempo real da PrimeSec: as últimas notícias de tecnologia e cibersegurança agregadas de fontes como Hacker News e DEV Community.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// Fetch só no client: a página é prerenderizada como casca estática
// e o feed hidrata "ao vivo" no navegador.
const { data: feed, status, error, refresh } = await useFetch<NewsFeed>('/api/news', {
  server: false,
  lazy: true
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
    title: 'Muitas atualizações',
    description: 'Aguarde alguns minutos antes de atualizar o feed novamente.',
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
        query: { fresh: '1' }
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
  if (refreshFeedback.value === 'loading' || isRefreshButtonLoading.value) return 'Atualizando notícias'
  if (refreshFeedback.value === 'success') return 'Notícias atualizadas'
  return 'Atualizar notícias'
})

type Filter = 'todas' | NewsCategory

const filters: Array<{ value: Filter, label: string, icon: string }> = [
  { value: 'todas', label: 'Todas', icon: 'i-lucide-newspaper' },
  { value: 'tecnologia', label: 'Tecnologia', icon: 'i-lucide-cpu' },
  { value: 'ciberseguranca', label: 'Cibersegurança', icon: 'i-lucide-shield' }
]

const activeFilter = ref<Filter>('todas')

const items = computed(() => {
  const all = feed.value?.items ?? []
  if (activeFilter.value === 'todas') return all
  return all.filter(item => item.category === activeFilter.value)
})

const updatedLabel = computed(() => {
  if (!syncedAt.value) return ''
  return syncedAt.value.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})
</script>

<template>
  <div class="relative">
    <GradientGlow class="top-0 w-2/3 h-96" />

    <UPageSection
      :ui="{
        root: 'relative z-10 pt-8 pb-16 sm:pt-10 sm:pb-24',
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
            label="Feed ao vivo · atualiza a cada 2 min"
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
          Radar de tecnologia
          <br>
          <span
            class="animate-shimmer bg-size-[200%_auto] bg-clip-text text-transparent"
            :style="{
              backgroundImage: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-300), var(--color-primary-200), var(--color-primary-100), var(--color-primary-200), var(--color-primary-300), var(--color-primary-400))',
              animationDuration: '10s'
            }"
          >
            e cibersegurança
          </span>
        </h1>

        <p
          class="primesec-enter mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-dimmed"
          style="--enter-delay: 0.4s"
        >
          O que está acontecendo agora no mundo da tecnologia e das ameaças digitais, agregado em tempo real de fontes que a comunidade confia.
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

        <div class="flex h-8 items-center gap-3">
          <span
            v-if="updatedLabel"
            class="font-mono text-xs leading-none text-dimmed"
          >
            atualizado às {{ updatedLabel }}
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
            Não foi possível carregar o feed agora. Verifique sua conexão e tente novamente.
          </p>
          <UButton
            label="Tentar novamente"
            color="primary"
            variant="soft"
            icon="i-lucide-refresh-cw"
            :loading="isRefreshing"
            @click="refreshFeed(true)"
          />
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

      <p class="mt-4 text-center font-mono text-xs text-dimmed">
        Fontes: Hacker News (Algolia API) e DEV Community. Os links abrem no site original.
      </p>
    </UPageSection>

    <LazyHomeCta
      title="Precisa de ajuda com o que leu por aqui?"
      description="Da correção de uma vulnerabilidade ao próximo produto: nossos times de desenvolvimento e segurança podem ajudar."
      command="priimesec@gmail.com"
      :links="[{ label: 'Falar conosco', color: 'primary', to: '/contato' }]"
      :hydrate-on-visible="{ rootMargin: '200px' }"
    />
  </div>
</template>
