<script setup lang="ts">
import type { NewsItem } from '#shared/types/news'

const props = defineProps<{
  item: NewsItem
}>()

const categoryBadge = computed(() => props.item.category === 'ciberseguranca'
  ? { label: 'Cibersegurança', color: 'primary' as const }
  : { label: 'Tecnologia', color: 'info' as const })

const topicBadge = computed(() => {
  switch (props.item.topic) {
    case 'ia':
      return { label: 'IA', color: 'success' as const }
    case 'uiux':
      return { label: 'UI/UX', color: 'warning' as const }
    default:
      return null
  }
})
</script>

<template>
  <article class="group relative flex h-full flex-col gap-3 bg-default p-5 transition-colors duration-300 hover:bg-elevated/60">
    <a
      :href="item.url"
      target="_blank"
      rel="noopener noreferrer"
      class="absolute inset-0 z-10"
    >
      <span class="sr-only">{{ item.title }}</span>
    </a>

    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <UBadge
          :label="categoryBadge.label"
          :color="categoryBadge.color"
          variant="soft"
          size="sm"
          class="rounded-full"
        />
        <UBadge
          v-if="topicBadge"
          :label="topicBadge.label"
          :color="topicBadge.color"
          variant="soft"
          size="sm"
          class="rounded-full"
        />
      </div>
      <time
        :datetime="item.publishedAt"
        class="font-mono text-xs text-dimmed"
      >
        {{ timeAgo(item.publishedAt) }}
      </time>
    </div>

    <h3 class="text-sm font-semibold leading-snug tracking-tight text-highlighted line-clamp-3 transition-colors duration-300 group-hover:text-primary">
      {{ item.title }}
    </h3>

    <p
      v-if="item.description"
      class="text-sm leading-relaxed text-dimmed line-clamp-2"
    >
      {{ item.description }}
    </p>

    <div class="mt-auto flex items-center gap-3 pt-2 text-xs text-muted">
      <span class="inline-flex items-center gap-1.5">
        <UIcon
          :name="item.sourceIcon"
          class="size-3.5"
        />
        {{ item.source }}
      </span>
      <span class="inline-flex items-center gap-1">
        <UIcon
          name="i-lucide-arrow-big-up"
          class="size-3.5"
        />
        {{ item.points }}
      </span>
      <span class="inline-flex items-center gap-1">
        <UIcon
          name="i-lucide-message-square"
          class="size-3.5"
        />
        {{ item.comments }}
      </span>
      <UIcon
        name="i-lucide-arrow-up-right"
        class="ml-auto size-4 text-dimmed transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>
  </article>
</template>
