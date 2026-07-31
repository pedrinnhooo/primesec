<script setup lang="ts">
import {
  METRIC_ICONS,
  METRIC_IDS,
  type MetricDetail,
  type MetricId
} from '~/utils/metric-themes'

const props = defineProps<{
  headline?: string
  title: string
  description: string
  items: Array<{
    value: string
    label: string
    class?: string
  }>
}>()

const { t, tm, rt } = useI18n()

const open = ref(false)
const active = ref<MetricDetail | null>(null)

function resolveDetail(id: MetricId, item: (typeof props.items)[number]): MetricDetail {
  const raw = tm(`home.metrics.details.${id}`) as Record<string, unknown> | undefined
  const about = raw?.about != null ? String(rt(raw.about as never)) : item.label
  const title = raw?.title != null ? String(rt(raw.title as never)) : item.label
  const description = raw?.description != null
    ? String(rt(raw.description as never))
    : item.label
  const highlightsRaw = raw?.highlights
  const nodesRaw = raw?.nodes

  const highlights = Array.isArray(highlightsRaw)
    ? highlightsRaw.map(h => String(rt(h as never)))
    : []
  const nodes = Array.isArray(nodesRaw)
    ? nodesRaw.map(n => String(rt(n as never)))
    : []

  return {
    id,
    value: item.value,
    label: item.label,
    class: item.class,
    icon: METRIC_ICONS[id],
    title,
    description,
    about,
    highlights,
    nodes
  }
}

function openMetric(item: (typeof props.items)[number], index: number) {
  const id = METRIC_IDS[index] ?? 'departments'
  active.value = resolveDetail(id, item)
  open.value = true
}
</script>

<template>
  <UPageSection
    id="metrics"
    :ui="{
      root: 'pt-0 pb-10 sm:pt-2 sm:pb-12 scroll-mt-(--ui-header-height)',
      container: 'max-w-5xl',
      headline: 'font-mono font-medium text-xs text-primary uppercase tracking-[0.12em] text-center',
      title: 'max-w-lg mx-auto',
      description: 'max-w-md mx-auto text-dimmed'
    }"
  >
    <template #headline>
      <ScrollReveal
        as="span"
        class="inline-block"
      >
        {{ headline }}
      </ScrollReveal>
    </template>

    <template #title>
      <ScrollReveal
        as="span"
        :delay="0.1"
        class="inline-block"
      >
        {{ title }}
      </ScrollReveal>
    </template>

    <template #description>
      <ScrollReveal
        as="span"
        :delay="0.2"
        class="inline-block"
      >
        {{ description }}
      </ScrollReveal>
    </template>

    <div class="overflow-hidden rounded-2xl border border-default">
      <div class="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <ScrollReveal
          v-for="(metric, index) in items"
          :key="metric.label"
          class="h-full"
          variant="fade"
          :delay="index * 0.08"
        >
          <button
            type="button"
            class="group relative h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
            @click="openMetric(metric, index)"
          >
            <UPageCard
              :title="metric.value"
              :description="metric.label"
              variant="ghost"
              class="h-full rounded-none bg-default duration-300 pointer-events-none group-hover:bg-elevated/50"
              :ui="{
                root: 'h-full text-center',
                container: 'h-full justify-center',
                wrapper: 'h-full items-center justify-center',
                title: ['text-4xl font-bold tracking-tight leading-none', metric.class],
                description: 'font-mono text-xs uppercase tracking-[0.06em] text-dimmed mt-3'
              }"
            />
            <span class="pointer-events-none absolute right-3 top-3 font-mono text-[10px] uppercase tracking-wider text-dimmed opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {{ t('home.metrics.modal.open') }}
            </span>
          </button>
        </ScrollReveal>
      </div>
    </div>

    <MetricModal
      v-model:open="open"
      :metric="active"
    />
  </UPageSection>
</template>
