<script setup lang="ts">
import type { ServiceDetail, ServiceId } from '~/utils/service-architectures'

const props = defineProps<{
  headline?: string
  title: string
  description: string
  items: Array<{
    id?: string
    icon?: string
    title: string
    description: string
  }>
}>()

const { t, tm, rt } = useI18n()

const open = ref(false)
const active = ref<ServiceDetail | null>(null)

function resolveDetail(id: ServiceId, item: (typeof props.items)[number]): ServiceDetail {
  const raw = tm(`home.features.details.${id}`) as Record<string, unknown> | undefined
  const about = raw?.about != null ? String(rt(raw.about as never)) : item.description
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
    icon: item.icon || 'i-lucide-layers',
    title: item.title,
    description: item.description,
    about,
    highlights,
    nodes
  }
}

function openService(item: (typeof props.items)[number], index: number) {
  const fallbackIds: ServiceId[] = [
    'frontend', 'mobile', 'backend', 'devops', 'architecture', 'uxui',
    'pentest', 'redteam', 'blueteam', 'purpleteam', 'lgpd', 'grc'
  ]
  const id = (item.id || fallbackIds[index] || 'frontend') as ServiceId
  active.value = resolveDetail(id, item)
  open.value = true
}
</script>

<template>
  <UPageSection
    id="features"
    :ui="{
      root: 'relative z-10 pt-0 pb-10 sm:pt-2 sm:pb-12 scroll-mt-(--ui-header-height)',
      container: 'max-w-5xl',
      headline: 'font-mono font-medium text-xs text-primary uppercase tracking-[0.12em] text-center',
      title: 'max-w-lg mx-auto',
      description: 'max-w-2xl mx-auto text-dimmed'
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

    <div class="rounded-2xl border border-default bg-default overflow-hidden">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
        <ScrollReveal
          v-for="(feature, index) in items"
          :key="feature.title"
          variant="fade"
          :delay="index * 0.08"
        >
          <button
            type="button"
            class="group relative h-full w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
            @click="openService(feature, index)"
          >
            <UPageCard
              :icon="feature.icon"
              :title="feature.title"
              :description="feature.description"
              class="rounded-none h-full duration-300 pointer-events-none group-hover:bg-elevated/50"
              :ui="{
                leading: 'mb-5 flex size-9 justify-center rounded-lg bg-primary/10',
                title: 'text-sm tracking-tight',
                description: 'text-sm leading-relaxed sm:line-clamp-2 lg:line-clamp-3 text-dimmed'
              }"
            />
            <span class="pointer-events-none absolute right-4 top-4 font-mono text-[10px] uppercase tracking-wider text-dimmed opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {{ t('home.features.modal.open') }}
            </span>
          </button>
        </ScrollReveal>
      </div>
    </div>

    <ServiceModal
      v-model:open="open"
      :service="active"
    />
  </UPageSection>
</template>
