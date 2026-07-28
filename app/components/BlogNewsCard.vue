<script setup lang="ts">
import type { NewsCategory, NewsItem, NewsTopic } from '#shared/types/news'

const props = defineProps<{
  item: NewsItem
}>()

/** Cores únicas por badge — nunca repetir entre categoria e subtema. */
const categoryMeta: Record<NewsCategory, { label: string, class: string }> = {
  tecnologia: {
    label: 'Tecnologia',
    class: '!bg-sky-400/15 !text-sky-300'
  },
  ciberseguranca: {
    label: 'Cibersegurança',
    class: '!bg-emerald-400/15 !text-emerald-300'
  }
}

const topicMeta: Record<NewsTopic, { label: string, class: string }> = {
  ia: { label: 'IA', class: '!bg-violet-400/15 !text-violet-300' },
  uiux: { label: 'UI/UX', class: '!bg-amber-400/15 !text-amber-300' },
  programacao: { label: 'Programação', class: '!bg-teal-400/15 !text-teal-300' },
  redteam: { label: 'Red Team', class: '!bg-red-400/15 !text-red-300' },
  blueteam: { label: 'Blue Team', class: '!bg-blue-400/15 !text-blue-300' },
  purpleteam: { label: 'Purple Team', class: '!bg-fuchsia-400/15 !text-fuchsia-300' },
  'lgpd-grc': { label: 'LGPD & GRC', class: '!bg-orange-400/15 !text-orange-300' }
}

const categoryBadge = computed(() => categoryMeta[props.item.category])
const topicBadge = computed(() => {
  const topic = props.item.topic
  return topic ? topicMeta[topic] : null
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
      <div class="flex flex-wrap items-center gap-1.5">
        <UBadge
          :label="categoryBadge.label"
          color="neutral"
          variant="soft"
          size="sm"
          class="rounded-full"
          :ui="{ base: categoryBadge.class }"
        />
        <UBadge
          v-if="topicBadge"
          :label="topicBadge.label"
          color="neutral"
          variant="soft"
          size="sm"
          class="rounded-full"
          :ui="{ base: topicBadge.class }"
        />
      </div>
      <time
        :datetime="item.publishedAt"
        class="shrink-0 font-mono text-xs text-dimmed"
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
      <span class="inline-flex min-w-0 items-center gap-1.5">
        <UIcon
          :name="item.sourceIcon"
          class="size-3.5 shrink-0"
        />
        <span class="truncate">{{ item.source }}</span>
      </span>
      <UIcon
        name="i-lucide-arrow-up-right"
        class="ml-auto size-4 shrink-0 text-dimmed transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>
  </article>
</template>
