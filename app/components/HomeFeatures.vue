<script setup lang="ts">
defineProps<{
  headline?: string
  title: string
  description: string
  items: Array<{
    icon?: string
    title: string
    description: string
  }>
}>()
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
          <UPageCard
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            class="rounded-none duration-300"
            to="#"
            :ui="{
              leading: 'mb-5 flex size-9 justify-center rounded-lg bg-primary/10',
              title: 'text-sm tracking-tight',
              description: 'text-sm leading-relaxed sm:line-clamp-2 lg:line-clamp-3 text-dimmed'
            }"
          />
        </ScrollReveal>
      </div>
    </div>
  </UPageSection>
</template>
