<script setup lang="ts">
import { ATTACK_META, ATTACK_TYPES } from '~/utils/globe/meta'

const { t, locale } = useI18n()
const stats = useAttackSimulation()

const languageTag = computed(() => {
  if (locale.value === 'en') return 'en-US'
  if (locale.value === 'es') return 'es-ES'
  return 'pt-BR'
})

const rows = computed(() => [
  { label: t('globe.activeAttacks'), value: String(stats.value.active) },
  { label: t('globe.attacksPerMin'), value: String(stats.value.perMinute) },
  { label: t('globe.topTarget'), value: stats.value.topTargetCountry },
  { label: t('globe.topSource'), value: stats.value.topSourceCountry },
  { label: t('globe.topThreat'), value: ATTACK_META[stats.value.topType].label },
  { label: t('globe.simulatedEvents'), value: stats.value.totalEvents.toLocaleString(languageTag.value) }
])
</script>

<template>
  <div class="w-60 rounded-xl border border-white/10 bg-black/55 p-4 font-mono backdrop-blur-md">
    <div class="flex items-center gap-2 border-b border-white/10 pb-3">
      <span class="relative flex size-2">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
        <span class="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      <span class="text-[10px] uppercase tracking-[0.18em] text-primary">
        {{ t('globe.title') }}
      </span>
    </div>

    <dl class="mt-3 space-y-2">
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-baseline justify-between gap-3"
      >
        <dt class="text-[10px] uppercase tracking-[0.08em] text-dimmed">
          {{ row.label }}
        </dt>
        <dd class="truncate text-xs font-semibold text-highlighted tabular-nums">
          {{ row.value }}
        </dd>
      </div>
    </dl>

    <div class="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/10 pt-3">
      <div
        v-for="type in ATTACK_TYPES"
        :key="type"
        class="flex items-center gap-1.5"
      >
        <span
          class="size-1.5 rounded-full"
          :style="{ backgroundColor: ATTACK_META[type].color, boxShadow: `0 0 6px ${ATTACK_META[type].color}` }"
        />
        <span class="text-[10px] text-muted">{{ ATTACK_META[type].label }}</span>
      </div>
    </div>

    <p class="mt-3 text-[9px] leading-relaxed text-dimmed/70">
      {{ t('globe.disclaimer') }}
    </p>
  </div>
</template>
