<script setup lang="ts">
import type { TechGuide } from '~/utils/tech-guides'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  tech: TechGuide | null
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const step = ref(0)
const playing = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  clearTimer()
  if (!playing.value || !props.tech?.steps.length) return
  timer = setInterval(() => {
    if (!props.tech) return
    step.value = (step.value + 1) % props.tech.steps.length
  }, 2200)
}

watch(open, (isOpen) => {
  step.value = 0
  playing.value = true
  if (isOpen) startTimer()
  else clearTimer()
})

watch(() => props.tech?.id, () => {
  step.value = 0
  if (open.value) startTimer()
})

watch(playing, (on) => {
  if (on && open.value) startTimer()
  else clearTimer()
})

onBeforeUnmount(() => clearTimer())

function selectStep(index: number) {
  step.value = index
  playing.value = false
}

function next() {
  if (!props.tech) return
  step.value = (step.value + 1) % props.tech.steps.length
  playing.value = false
}

function prev() {
  if (!props.tech) return
  step.value = (step.value - 1 + props.tech.steps.length) % props.tech.steps.length
  playing.value = false
}

function close() {
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      overlay: 'bg-black/70 backdrop-blur-sm',
      content: 'bg-[#080b08] ring ring-white/10 divide-y divide-white/10 w-[min(96vw,52rem)] max-h-[min(92vh,40rem)] overflow-hidden',
      header: 'bg-transparent p-5 sm:px-8 sm:py-6',
      body: 'bg-transparent p-5 sm:p-8 overflow-y-auto',
      footer: 'bg-transparent p-5 sm:px-8 sm:py-5'
    }"
  >
    <template
      v-if="tech"
      #header
    >
      <div class="flex min-w-0 flex-1 items-start gap-4 pr-10">
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-xl ring-1"
          :style="{
            background: `color-mix(in srgb, ${tech.color} 14%, transparent)`,
            borderColor: `color-mix(in srgb, ${tech.color} 35%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tech.color} 28%, transparent)`
          }"
        >
          <UIcon
            :name="tech.icon"
            class="size-6"
            :style="{ color: tech.color }"
          />
        </div>
        <div class="min-w-0">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/80">
            primesec · {{ t('home.logos.modal.howto') }} / {{ tech.id }}
          </p>
          <h2 class="mt-1.5 text-lg font-semibold tracking-tight text-highlighted sm:text-xl">
            {{ tech.label }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-dimmed">
            {{ tech.description }}
          </p>
        </div>
      </div>
    </template>

    <template
      v-if="tech"
      #body
    >
      <div class="flex flex-col gap-8">
        <!-- Fluxo interativo -->
        <div
          class="relative overflow-hidden rounded-xl border border-white/10 bg-[#070a07] p-5 sm:p-6"
          :style="{ '--tech-color': tech.color }"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-30"
            style="background-image:
              linear-gradient(color-mix(in oklch, var(--tech-color) 22%, transparent) 1px, transparent 1px),
              linear-gradient(90deg, color-mix(in oklch, var(--tech-color) 22%, transparent) 1px, transparent 1px);
              background-size: 24px 24px;"
          />

          <div class="relative z-10 flex flex-col gap-5">
            <div class="flex items-center justify-between gap-3">
              <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-dimmed">
                {{ t('home.logos.modal.steps') }}
              </p>
              <div class="flex items-center gap-1.5">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-chevron-left"
                  :aria-label="t('home.logos.modal.prev')"
                  @click="prev"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'"
                  :aria-label="t('home.logos.modal.play')"
                  @click="playing = !playing"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-chevron-right"
                  :aria-label="t('home.logos.modal.next')"
                  @click="next"
                />
              </div>
            </div>

            <div class="flex items-center justify-center gap-2 sm:gap-3">
              <template
                v-for="(s, index) in tech.steps"
                :key="index"
              >
                <button
                  type="button"
                  class="tech-step group flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 sm:size-12"
                  :class="step === index
                    ? 'scale-110 border-transparent text-[#080b08]'
                    : 'border-white/15 bg-white/[0.03] text-dimmed hover:border-white/30 hover:text-highlighted'"
                  :style="step === index
                    ? { background: tech.color, boxShadow: `0 0 20px color-mix(in srgb, ${tech.color} 45%, transparent)` }
                    : undefined"
                  @click="selectStep(index)"
                >
                  {{ index + 1 }}
                </button>
                <div
                  v-if="index < tech.steps.length - 1"
                  class="h-px w-6 flex-1 max-w-12 sm:w-10 sm:max-w-16"
                  :class="step > index ? 'opacity-100' : 'opacity-30'"
                  :style="{ background: `linear-gradient(90deg, ${tech.color}, color-mix(in srgb, ${tech.color} 30%, transparent))` }"
                />
              </template>
            </div>

            <p
              :key="step"
              class="tech-step-copy min-h-[3.2rem] text-center text-sm leading-relaxed text-toned sm:text-[15px]"
            >
              {{ tech.steps[step] }}
            </p>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-dimmed">
              {{ t('home.logos.modal.about') }}
            </p>
            <p class="mt-2.5 text-sm leading-relaxed text-toned">
              {{ tech.about }}
            </p>
          </div>
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-dimmed">
              {{ t('home.logos.modal.uses') }}
            </p>
            <ul class="mt-2.5 space-y-2.5">
              <li
                v-for="use in tech.uses"
                :key="use"
                class="flex items-start gap-2.5 text-sm text-toned"
              >
                <span
                  class="mt-1.5 size-1.5 shrink-0 rounded-full"
                  :style="{ background: tech.color, boxShadow: `0 0 8px ${tech.color}` }"
                />
                <span>{{ use }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <template
      v-if="tech"
      #footer
    >
      <div class="flex w-full flex-wrap items-center justify-end gap-3">
        <UButton
          :label="t('home.logos.modal.close')"
          color="neutral"
          variant="ghost"
          @click="close"
        />
        <UButton
          :label="t('home.logos.modal.cta')"
          color="primary"
          :to="localePath('contato')"
          @click="close"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.tech-step-copy {
  animation: tech-step-fade 0.28s ease;
}

@keyframes tech-step-fade {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
