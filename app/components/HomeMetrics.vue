<script setup lang="ts">
defineProps<{
  headline?: string
  title: string
  description: string
  items: Array<{
    value: string
    label: string
    class?: string
  }>
}>()
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
      <!-- Divisórias via gap-px (altura total da linha). Ghost evita ring por card. -->
      <div class="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <ScrollReveal
          v-for="(metric, index) in items"
          :key="metric.label"
          class="h-full"
          variant="fade"
          :delay="index * 0.08"
        >
          <UPageCard
            :title="metric.value"
            :description="metric.label"
            variant="ghost"
            class="h-full rounded-none bg-default duration-300"
            to="#"
            :ui="{
              root: 'h-full text-center',
              container: 'h-full justify-center',
              wrapper: 'h-full items-center justify-center',
              title: ['text-4xl font-bold tracking-tight leading-none', metric.class],
              description: 'font-mono text-xs uppercase tracking-[0.06em] text-dimmed mt-3'
            }"
          />
        </ScrollReveal>
      </div>
    </div>
  </UPageSection>
</template>
