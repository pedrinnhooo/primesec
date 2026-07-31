<script setup lang="ts">
import type { TechGuide } from '~/utils/tech-guides'

export interface StackLogoItem {
  id?: string
  icon: string
  label: string
  description?: string
  /** Cor de marca no hover/tooltip (hex). */
  color: string
}

export interface StackLogoGroup {
  id: string
  title: string
  items: readonly StackLogoItem[]
}

defineProps<{
  title: string
  groups: readonly StackLogoGroup[]
}>()

const { t, tm, rt } = useI18n()

const active = ref<string | null>(null)
const modalOpen = ref(false)
const activeTech = ref<TechGuide | null>(null)

const COLS = 4

function honeycombRows(items: readonly StackLogoItem[]) {
  const rows: StackLogoItem[][] = []
  for (let i = 0; i < items.length; i += COLS) {
    rows.push([...items.slice(i, i + COLS)])
  }
  return rows
}

function cellKey(groupId: string, label: string) {
  return `${groupId}:${label}`
}

function tipStyle(color: string) {
  return {
    background: `color-mix(in srgb, ${color} 18%, #0a0d0a)`,
    borderColor: `color-mix(in srgb, ${color} 48%, transparent)`,
    boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 24%, transparent), 0 14px 36px color-mix(in srgb, ${color} 20%, transparent)`
  }
}

function resolveGuide(item: StackLogoItem): TechGuide {
  const id = item.id || item.label.toLowerCase()
  const raw = tm(`home.logos.guides.${id}`) as Record<string, unknown> | undefined
  const about = raw?.about != null ? String(rt(raw.about as never)) : (item.description || item.label)
  const stepsRaw = raw?.steps
  const usesRaw = raw?.uses
  const steps = Array.isArray(stepsRaw)
    ? stepsRaw.map(s => String(rt(s as never)))
    : [item.description || item.label]
  const uses = Array.isArray(usesRaw)
    ? usesRaw.map(u => String(rt(u as never)))
    : []

  return {
    id,
    icon: item.icon,
    label: item.label,
    color: item.color,
    description: item.description || item.label,
    about,
    steps,
    uses
  }
}

function openModal(item: StackLogoItem) {
  activeTech.value = resolveGuide(item)
  modalOpen.value = true
}
</script>

<template>
  <div class="stack-logos w-full">
    <p class="mb-9 text-center font-mono text-sm uppercase tracking-[0.14em] text-dimmed sm:mb-11">
      {{ title }}
    </p>

    <div class="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-20 xl:gap-x-24">
      <section
        v-for="(group, index) in groups"
        :key="group.id"
        class="stack-logos__group flex flex-col items-center px-3 sm:px-4"
        :class="index === groups.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''"
      >
        <h3 class="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80 sm:mb-10">
          <span class="size-1 rounded-full bg-primary shadow-[0_0_6px_var(--ui-primary)]" />
          {{ group.title }}
        </h3>

        <div class="honeycomb">
          <div
            v-for="(row, rowIndex) in honeycombRows(group.items)"
            :key="`${group.id}-row-${rowIndex}`"
            class="honeycomb__row"
            :class="{ 'honeycomb__row--offset': rowIndex % 2 === 1 }"
          >
            <div
              v-for="item in row"
              :key="`${group.id}-${item.label}`"
              class="honeycomb__cell"
              :class="{
                'honeycomb__cell--active': active === cellKey(group.id, item.label),
                'honeycomb__cell--dim': active && active !== cellKey(group.id, item.label),
                'honeycomb__cell--open': active === cellKey(group.id, item.label)
              }"
              :style="{ '--stack-color': item.color }"
              @mouseenter="active = cellKey(group.id, item.label)"
              @mouseleave="active = null"
            >
              <button
                type="button"
                class="honeycomb__hex outline-none"
                :aria-label="`${item.label}. ${t('home.logos.modal.open')}`"
                @click="openModal(item)"
              >
                <UIcon
                  :name="item.icon"
                  class="honeycomb__icon size-6 sm:size-7"
                />
                <span class="honeycomb__label">
                  {{ item.label }}
                </span>
              </button>

              <div
                v-show="active === cellKey(group.id, item.label)"
                class="honeycomb__tip"
                role="tooltip"
                :style="tipStyle(item.color)"
              >
                <p
                  class="font-mono text-[10px] uppercase tracking-[0.14em]"
                  :style="{ color: item.color }"
                >
                  {{ item.label }}
                </p>
                <p class="mt-1 text-[11px] leading-relaxed text-toned">
                  {{ item.description }}
                </p>
                <p class="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-dimmed">
                  {{ t('home.logos.modal.clickHint') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <TechModal
      v-model:open="modalOpen"
      :tech="activeTech"
    />
  </div>
</template>

<style scoped>
.honeycomb {
  /* Hexágono regular pointy-top, centralizado, com gap entre células */
  --hex: 4.5rem;
  --hex-h: calc(var(--hex) * 1.1547);
  --gap: 0.75rem;
  --step: calc(var(--hex) + var(--gap));
  /* Puxa a linha seguinte para o “vale”, sem colar (gap permanece) */
  --row-pull: calc(var(--hex-h) * 0.25 - var(--gap) * 0.5);

  display: flex;
  width: fit-content;
  max-width: 100%;
  flex-direction: column;
  align-items: center;
  margin-inline: auto;
}

@media (min-width: 640px) {
  .honeycomb {
    --hex: 5rem;
    --gap: 0.9rem;
  }
}

.honeycomb__row {
  display: flex;
  justify-content: center;
  gap: var(--gap);
  /* Compensa o offset da linha ímpar para o bloco ficar no centro */
  transform: translateX(calc(var(--step) / -4));
}

.honeycomb__row + .honeycomb__row {
  margin-top: calc(var(--row-pull) * -1);
}

.honeycomb__row--offset {
  /* Desloca meio passo em relação à linha par → colmeia centralizada */
  transform: translateX(calc(var(--step) / 4));
}

.honeycomb__cell {
  position: relative;
  z-index: 1;
  width: var(--hex);
  height: var(--hex-h);
  flex-shrink: 0;
  transition: opacity 0.35s ease;
}

.honeycomb__cell--open {
  z-index: 30;
}

.honeycomb__cell--dim {
  opacity: 0.28;
}

.honeycomb__hex {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  padding: 0.35rem 0.45rem 0.55rem;
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
  background:
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--stack-color) 16%, transparent),
      color-mix(in oklch, white 5%, transparent)
    );
  transition:
    background 0.3s ease,
    transform 0.3s ease,
    filter 0.3s ease;
}

.honeycomb__hex::before {
  content: '';
  position: absolute;
  inset: 2px;
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
  background: #0a0d0a;
  z-index: 0;
  transition: background 0.3s ease;
}

.honeycomb__icon {
  position: relative;
  z-index: 1;
  color: color-mix(in oklch, var(--ui-text-muted) 92%, transparent);
  filter: grayscale(1);
  transition:
    color 0.3s ease,
    filter 0.3s ease,
    transform 0.3s ease;
}

.honeycomb__label {
  position: relative;
  z-index: 1;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 7.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--ui-text-dimmed) 75%, transparent);
  opacity: 0.65;
  transition:
    opacity 0.3s ease,
    color 0.3s ease;
}

.honeycomb__tip {
  position: absolute;
  bottom: calc(100% + 0.25rem);
  left: 50%;
  z-index: 40;
  width: max-content;
  max-width: 14rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid;
  border-radius: 0.55rem;
  text-align: left;
  transform: translateX(-50%);
  animation: honeycomb-tip-in 0.16s ease-out;
  pointer-events: none;
}

.honeycomb__tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: color-mix(in srgb, var(--stack-color) 48%, transparent);
  transform: translateX(-50%);
}

.honeycomb__cell--active .honeycomb__hex {
  z-index: 2;
  transform: scale(1.06);
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--stack-color) 38%, transparent),
    color-mix(in srgb, var(--stack-color) 10%, transparent)
  );
}

.honeycomb__cell--active .honeycomb__hex::before {
  background: color-mix(in srgb, var(--stack-color) 12%, #0a0d0a);
}

.honeycomb__cell--active .honeycomb__icon {
  color: var(--stack-color);
  filter: grayscale(0) drop-shadow(0 0 8px color-mix(in srgb, var(--stack-color) 50%, transparent));
  transform: scale(1.05);
}

.honeycomb__cell--active .honeycomb__label {
  opacity: 1;
  color: var(--stack-color);
}

@keyframes honeycomb-tip-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .honeycomb__cell,
  .honeycomb__hex,
  .honeycomb__icon,
  .honeycomb__label {
    transition: none;
  }

  .honeycomb__tip {
    animation: none;
  }
}
</style>
