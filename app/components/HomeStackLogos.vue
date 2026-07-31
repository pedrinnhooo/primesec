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

/** Empilha em linhas de colmeia: 4 / 4 offset / 4 … → 3 linhas */
function honeycombRows(items: readonly StackLogoItem[]) {
  const cols = 4
  const rows: StackLogoItem[][] = []
  for (let i = 0; i < items.length; i += cols) {
    rows.push([...items.slice(i, i + cols)])
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
                  class="honeycomb__icon size-7 sm:size-8"
                />
              </button>

              <span class="honeycomb__label">
                {{ item.label }}
              </span>

              <!-- Tip no hover -->
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
  --hex-size: 4.25rem;
  --hex-gap: 0.95rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}

@media (min-width: 640px) {
  .honeycomb {
    --hex-size: 4.65rem;
    --hex-gap: 1.1rem;
  }
}

.honeycomb__row {
  display: flex;
  justify-content: center;
  gap: var(--hex-gap);
}

.honeycomb__row--offset {
  padding-inline: calc((var(--hex-size) + var(--hex-gap)) / 2);
}

.honeycomb__row + .honeycomb__row {
  margin-top: 0.6rem;
}

.honeycomb__cell {
  position: relative;
  z-index: 1;
  display: flex;
  width: var(--hex-size);
  flex-direction: column;
  align-items: center;
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
  width: var(--hex-size);
  height: calc(var(--hex-size) * 1.08);
  align-items: center;
  justify-content: center;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background:
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--stack-color) 14%, transparent),
      color-mix(in oklch, white 4%, transparent)
    );
  transition:
    background 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.honeycomb__hex::before {
  content: '';
  position: absolute;
  inset: 1px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
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
  margin-top: 0.4rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in oklch, var(--ui-text-dimmed) 70%, transparent);
  opacity: 0.55;
  transition:
    opacity 0.3s ease,
    color 0.3s ease;
}

.honeycomb__tip {
  position: absolute;
  bottom: calc(100% + 0.55rem);
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
  transform: translateY(-2px) scale(1.04);
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--stack-color) 35%, transparent),
    color-mix(in srgb, var(--stack-color) 8%, transparent)
  );
}

.honeycomb__cell--active .honeycomb__hex::before {
  background: color-mix(in srgb, var(--stack-color) 12%, #0a0d0a);
}

.honeycomb__cell--active .honeycomb__icon {
  color: var(--stack-color);
  filter: grayscale(0) drop-shadow(0 0 8px color-mix(in srgb, var(--stack-color) 50%, transparent));
  transform: scale(1.06);
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
