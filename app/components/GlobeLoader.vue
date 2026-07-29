<script setup lang="ts">
/**
 * Tela de carregamento exibida até o globo estar 100% renderizado.
 *
 * O letreiro e o radar são CSS puro (já animam no HTML pré-renderizado).
 * A % conta de 1 em 1: um script cedo (`/loader-count.js`) começa antes da
 * hidratação; o Vue assume. A barra é o mesmo attack do nav (traço + signal).
 */
const props = defineProps<{
  /** Progresso real da montagem do globo, de 0 a 1. */
  progress: number
}>()

const emit = defineEmits<{
  /** Disparado quando a contagem exibida termina em 100%. */
  (e: 'done'): void
}>()

const { tm, rt, locale } = useI18n()

const messages = computed(() => {
  void locale.value
  const raw = tm('loader.messages') as unknown[]
  return raw.map(item => typeof item === 'string' ? item : rt(item as never))
})

declare global {
  interface Window {
    __primesecLoaderPercent?: number
    __primesecLoaderTakeover?: boolean
  }
}

function readPreloadPercent(): number {
  if (!import.meta.client) return 0
  const pre = window.__primesecLoaderPercent
  return typeof pre === 'number' ? Math.min(96, Math.max(0, Math.round(pre))) : 0
}

/** Contagem inteira (0–100). Nunca salta mais de 1 por tick. */
const percent = ref(import.meta.client ? readPreloadPercent() : 0)

let timer: ReturnType<typeof setTimeout> | undefined
let doneEmitted = false
let startedAt = 0
let running = false

function targetPercent(now: number): number {
  if (props.progress >= 1) return 100

  const fromProp = Math.round(props.progress * 100)
  // Avanço por tempo garante contagem mesmo sem eventos do globo.
  const fromTime = Math.floor((now - startedAt) / 55)
  return Math.min(97, Math.max(fromProp, fromTime, percent.value))
}

function schedule(next: () => void, ms: number) {
  timer = setTimeout(() => {
    requestAnimationFrame(next)
  }, ms)
}

function tick() {
  if (!running) return

  const now = performance.now()
  const target = targetPercent(now)

  if (percent.value < target) {
    percent.value += 1
    window.__primesecLoaderPercent = percent.value
  }

  if (percent.value >= 100) {
    if (!doneEmitted) {
      doneEmitted = true
      emit('done')
    }
    return
  }

  const behind = target - percent.value
  // Sprint final e recuperação após bloqueio da main thread: ainda +1, só mais rápido.
  const delay = props.progress >= 1 ? 28 : behind > 3 ? 22 : 55
  schedule(tick, delay)
}

useHead({
  htmlAttrs: {
    class: 'overflow-hidden'
  },
  script: [
    {
      key: 'primesec-loader-count',
      src: '/loader-count.js',
      // Fetch cedo; executa após o parse (loader já está no DOM).
      defer: true,
      tagPosition: 'head'
    }
  ]
})

onMounted(() => {
  // Só agora o Vue assume a contagem; até aqui o script cedo segue ativo.
  window.__primesecLoaderTakeover = true
  percent.value = Math.max(percent.value, readPreloadPercent())
  startedAt = performance.now() - percent.value * 55
  running = true
  schedule(tick, 55)
})

onBeforeUnmount(() => {
  running = false
  clearTimeout(timer)
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

      <div class="h-7 overflow-hidden">
        <div
          class="primesec-marquee"
          :style="{ '--marquee-count': messages.length }"
        >
          <p
            v-for="line in messages"
            :key="line"
            class="flex h-7 items-center justify-center font-mono text-base text-toned"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </div>

    <!-- Traço fino + signal luminoso (mesmo attack do nav/globo). % fixa à direita. -->
    <div class="flex w-72 max-w-[70vw] items-center gap-3">
      <div class="primesec-loader-bar">
        <div
          class="primesec-loader-bar__fill"
          data-loader-fill
          :style="{ width: `${percent}%` }"
        >
          <span
            class="primesec-loader-bar__signal"
            aria-hidden="true"
          />
        </div>
      </div>
      <span
        data-loader-pct
        class="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted"
      >{{ percent }}%</span>
    </div>
  </div>
</template>
