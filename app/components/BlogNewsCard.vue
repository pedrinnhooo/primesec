<script setup lang="ts">
import type { NewsCategory, NewsItem, NewsTag, NewsTopic } from '#shared/types/news'

const props = defineProps<{
  item: NewsItem
}>()

const { t, locale } = useI18n()
const formatTimeAgo = useTimeAgo()

/** Cores únicas por badge — nunca repetir entre categoria e subtema. */
const categoryClass: Record<NewsCategory, string> = {
  tecnologia: '!bg-sky-400/15 !text-sky-300',
  ciberseguranca: '!bg-emerald-400/15 !text-emerald-300'
}

const topicClass: Record<NewsTopic, string> = {
  geral: '!bg-zinc-400/15 !text-zinc-300',
  ia: '!bg-violet-400/15 !text-violet-300',
  uiux: '!bg-amber-400/15 !text-amber-300',
  frontend: '!bg-cyan-400/15 !text-cyan-300',
  backend: '!bg-lime-400/15 !text-lime-300',
  database: '!bg-rose-400/15 !text-rose-300',
  mobile: '!bg-teal-400/15 !text-teal-300',
  redteam: '!bg-red-400/15 !text-red-300',
  blueteam: '!bg-blue-400/15 !text-blue-300',
  purpleteam: '!bg-fuchsia-400/15 !text-fuchsia-300',
  'lgpd-grc': '!bg-orange-400/15 !text-orange-300'
}

const tagClass: Record<NewsTag, string> = {
  flutter: '!bg-sky-300/15 !text-sky-200',
  'react-native': '!bg-cyan-300/15 !text-cyan-200',
  ios: '!bg-zinc-300/15 !text-zinc-200',
  android: '!bg-green-400/15 !text-green-300'
}

const categoryBadge = computed(() => ({
  label: t(`categories.${props.item.category}`),
  class: categoryClass[props.item.category]
}))

const topicBadge = computed(() => {
  const topic = props.item.topic
  if (!topic) return null
  return {
    label: t(`topics.${topic}`),
    class: topicClass[topic]
  }
})

const tagBadges = computed(() => {
  const tags = props.item.tags
  if (!tags?.length) return []
  return tags.map(tag => ({
    label: t(`tags.${tag}`),
    class: tagClass[tag]
  }))
})

const relativeTime = computed(() => {
  void locale.value
  return formatTimeAgo(props.item.publishedAt)
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
        <UBadge
          v-for="badge in tagBadges"
          :key="badge.label"
          :label="badge.label"
          color="neutral"
          variant="soft"
          size="sm"
          class="rounded-full"
          :ui="{ base: badge.class }"
        />
      </div>
      <time
        :datetime="item.publishedAt"
        class="shrink-0 font-mono text-xs text-dimmed"
      >
        {{ relativeTime }}
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
        class="ml-auto size-4 shrink-0 text-dimmed transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>
  </article>
</template>
