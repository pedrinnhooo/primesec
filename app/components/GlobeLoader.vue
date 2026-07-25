<script setup lang="ts">
/**
 * Tela de carregamento exibida até o globo estar 100% renderizado.
 *
 * O letreiro de mensagens e o radar são animações CSS puras: eles já rodam no
 * HTML pré-renderizado, antes da hidratação, então nada aparece congelado.
 * A barra reflete o progresso real reportado pelo CyberGlobe, com um avanço
 * mínimo por tick para nunca parecer travada entre uma etapa e outra.
 */
const props = defineProps<{
  /** Progresso real da montagem do globo, de 0 a 1. */
  progress: number
}>()

const MESSAGES = [
  'Analisando ameaças...',
  'Carregando mapa global...',
  'Sincronizando eventos...',
  'Processando inteligência...',
  'Identificando ataques...',
  'Preparando visualização...',
  'Finalizando carregamento...'
]
const TICK_MS = 100

/** Valor suavizado; sobe sempre, nunca regride. */
const displayed = ref(0)
const percent = computed(() => Math.round(displayed.value * 100))

let ticker: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  ticker = setInterval(() => {
    const target = props.progress
    if (target >= 1) {
      displayed.value = 1
      return
    }
    // Enquanto a etapa não avança, rasteja devagar até um teto à frente dela.
    const step = Math.max((target - displayed.value) * 0.28, 0.005)
    displayed.value = Math.min(displayed.value + step, Math.min(target + 0.12, 0.97))
  }, TICK_MS)
})

onBeforeUnmount(() => clearInterval(ticker))

// O 100% não pode esperar o próximo tick: em conexões rápidas a revelação chega
// antes dele e a barra sairia de cena marcando uma porcentagem baixa.
watch(() => props.progress, (value) => {
  if (value >= 1) displayed.value = 1
})

// Trava a rolagem da página atrás do overlay (inclusive no HTML pré-renderizado).
useHead({
  htmlAttrs: {
    class: 'overflow-hidden'
  }
})
</script>

<template>
  <div
    id="globe-loader"
    class="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8 bg-(--ui-bg)"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <!-- Globo em wireframe sob varredura de radar -->
    <div
      class="relative flex size-36 items-center justify-center"
      aria-hidden="true"
    >
      <span class="absolute inset-0 animate-globe-pulse rounded-full border border-primary/50" />
      <span class="absolute inset-0 animate-globe-pulse rounded-full border border-primary/30 [animation-delay:1.3s]" />

      <span class="absolute inset-3 overflow-hidden rounded-full border border-primary/35 bg-[radial-gradient(circle_at_36%_30%,#0d160d_0%,#050705_58%,#020302_100%)] shadow-[0_0_50px_-14px_var(--ui-primary),inset_0_0_26px_-8px_var(--ui-primary)]">
        <span class="absolute inset-0 animate-spin [animation-duration:2.8s] bg-[conic-gradient(from_0deg,color-mix(in_oklch,var(--ui-primary)_26%,transparent)_0deg,transparent_55deg)]" />
        <span class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-primary/40" />
        <span class="absolute inset-x-1.5 top-[26%] h-px rounded-[50%] border-t border-primary/20" />
        <span class="absolute inset-x-1.5 bottom-[26%] h-px rounded-[50%] border-t border-primary/20" />
        <span class="absolute inset-y-0 left-1/2 w-1/2 animate-globe-meridian rounded-[50%] border border-primary/30" />
      </span>

      <span class="relative size-1.5 rounded-full bg-primary shadow-[0_0_14px_3px_var(--ui-primary)]" />
    </div>

    <div class="flex flex-col items-center gap-4 px-6">
      <p class="font-mono text-[11px] uppercase tracking-[0.38em] text-primary">
        PrimeSec
      </p>

      <!-- Letreiro: a coluna de mensagens sobe de uma em uma, em loop -->
      <div class="h-7 overflow-hidden">
        <div
          class="primesec-marquee"
          :style="{ '--marquee-count': MESSAGES.length }"
        >
          <p
            v-for="line in MESSAGES"
            :key="line"
            class="flex h-7 items-center justify-center font-mono text-base text-toned"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex w-72 max-w-[70vw] items-center gap-4">
      <div class="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <!-- Varredura em CSS: a barra tem vida mesmo antes da hidratação. -->
        <span
          class="absolute inset-y-0 w-1/5 animate-loader-scan bg-linear-to-r from-transparent via-primary/60 to-transparent"
          aria-hidden="true"
        />
        <div
          class="relative h-full rounded-full bg-primary shadow-[0_0_10px_1px_var(--ui-primary)] ease-out"
          :class="percent < 100 && 'transition-[width] duration-200'"
          :style="{ width: `${percent}%` }"
        />
      </div>
      <span class="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
        {{ percent }}%
      </span>
    </div>
  </div>
</template>
