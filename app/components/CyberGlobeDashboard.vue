<script setup lang="ts">
import { ATTACK_META, ATTACK_TYPES } from '~/utils/globe/meta'

const stats = useAttackSimulation()

const rows = computed(() => [
  { label: 'Ataques ativos', value: String(stats.value.active) },
  { label: 'Ataques / min', value: String(stats.value.perMinute) },
  { label: 'Mais atacado', value: stats.value.topTargetCountry },
  { label: 'Maior origem', value: stats.value.topSourceCountry },
  { label: 'Ameaça dominante', value: ATTACK_META[stats.value.topType].label },
  { label: 'Eventos simulados', value: stats.value.totalEvents.toLocaleString('pt-BR') }
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
        Global Threat Monitor
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
      Simulação ilustrativa em tempo real
    </p>
  </div>
</template>
