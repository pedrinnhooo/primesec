<script setup lang="ts">
import type { TechGuide } from '~/utils/tech-guides'

export interface StackLogoItem {
  id?: string
  icon: string
  label: string
  description?: string
  color: string
}

export interface StackLogoGroup {
  id: string
  title: string
  items: readonly StackLogoItem[]
}

const props = defineProps<{
  title: string
  groups: readonly StackLogoGroup[]
}>()

const { t, tm, rt } = useI18n()

const active = ref<string | null>(null)
const modalOpen = ref(false)
const activeTech = ref<TechGuide | null>(null)

const COLS = 4
const CELLS = 12
const HEX_POINTS = '50,2.2 97.8,29.2 97.8,86.3 50,113.3 2.2,86.3 2.2,29.2'

type StrokePhase = 'trace' | 'leave' | 'bridge' | 'enter'

interface GroupStroke {
  /** Ordem aleatória de visita das células (só animação). */
  order: number[]
  /** Cursor na order. */
  cursor: number
  phase: StrokePhase
  from: number
  to: number
}

/** Colunas na ordem definida em HOME_LOGO_GROUPS. */
const displayGroups = ref<StackLogoGroup[]>([])
const strokes = ref<Record<string, GroupStroke>>({})
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function shuffle<T>(list: T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

function makeOrder() {
  return shuffle(Array.from({ length: CELLS }, (_, i) => i))
}

function initStrokes(groups: readonly StackLogoGroup[]) {
  // Ordem fixa dos grupos — só a animação do traço é aleatória.
  displayGroups.value = [...groups]
  const next: Record<string, GroupStroke> = {}
  groups.forEach((group, i) => {
    const order = makeOrder()
    next[group.id] = {
      order,
      cursor: 0,
      phase: 'trace',
      from: order[0]!,
      to: order[1 % order.length]!
    }
    // Stagger start so columns don't sync
    timers.set(group.id, setTimeout(() => {
      // kick is implicit — first cell already in trace
    }, i * 280))
  })
  strokes.value = next
}

watch(() => props.groups, (groups) => {
  timers.forEach(clearTimeout)
  timers.clear()
  if (groups?.length) initStrokes(groups)
}, { immediate: true })

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers.clear()
})

function cellIndex(rowIndex: number, itemIndex: number) {
  return rowIndex * COLS + itemIndex
}

function strokeOf(groupId: string) {
  return strokes.value[groupId]
}

function currentCell(groupId: string) {
  const s = strokeOf(groupId)
  if (!s) return -1
  return s.order[s.cursor]!
}

function nextCell(groupId: string) {
  const s = strokeOf(groupId)
  if (!s) return -1
  return s.order[(s.cursor + 1) % s.order.length]!
}

/** Centro da célula no sistema de coordenadas do overlay da colmeia. */
function cellCenter(index: number) {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  const hex = 80 // viewBox units roughly matching layout ratio
  const gap = 14
  const step = hex + gap
  const hexH = hex * 1.1547
  const rowPull = hexH * 0.75
  const offset = row % 2 === 1 ? step / 2 : 0
  // Compensate row centering shift (±step/4)
  const centerShift = row % 2 === 1 ? step / 4 : -step / 4
  return {
    x: 40 + col * step + offset + centerShift + hex / 2,
    y: 20 + row * rowPull + hexH / 2
  }
}

function bridgePath(groupId: string) {
  const s = strokeOf(groupId)
  if (!s) return ''
  const a = cellCenter(s.from)
  const b = cellCenter(s.to)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2 - 12
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`
}

function bridgeColor(groupId: string, groups: readonly StackLogoGroup[]) {
  const s = strokeOf(groupId)
  const group = groups.find(g => g.id === groupId)
  if (!s || !group) return '#00dc82'
  const fromItem = group.items[s.from]
  const toItem = group.items[s.to]
  // Mid-transition color: prefer leaving cell, then entering
  return s.phase === 'enter' ? (toItem?.color || '#00dc82') : (fromItem?.color || '#00dc82')
}

function patchStroke(groupId: string, patch: Partial<GroupStroke>) {
  const cur = strokes.value[groupId]
  if (!cur) return
  strokes.value = {
    ...strokes.value,
    [groupId]: { ...cur, ...patch }
  }
}

function onTraceEnd(groupId: string, index: number) {
  const s = strokeOf(groupId)
  if (!s || s.phase !== 'trace' || index !== currentCell(groupId)) return
  const from = currentCell(groupId)
  const to = nextCell(groupId)
  patchStroke(groupId, { phase: 'leave', from, to })
}

function onLeaveEnd(groupId: string, index: number) {
  const s = strokeOf(groupId)
  if (!s || s.phase !== 'leave' || index !== s.from) return
  patchStroke(groupId, { phase: 'bridge' })
}

function onBridgeEnd(groupId: string) {
  const s = strokeOf(groupId)
  if (!s || s.phase !== 'bridge') return
  patchStroke(groupId, { phase: 'enter' })
}

function onEnterEnd(groupId: string, index: number) {
  const s = strokeOf(groupId)
  if (!s || s.phase !== 'enter' || index !== s.to) return
  const nextCursor = (s.cursor + 1) % s.order.length
  const from = s.order[nextCursor]!
  const to = s.order[(nextCursor + 1) % s.order.length]!
  patchStroke(groupId, {
    cursor: nextCursor,
    phase: 'trace',
    from,
    to
  })
}

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

function showFlow(groupId: string, index: number) {
  const s = strokeOf(groupId)
  if (!s) return false
  if (s.phase === 'trace') return index === currentCell(groupId)
  if (s.phase === 'leave') return index === s.from
  if (s.phase === 'enter') return index === s.to
  return false
}

function flowClass(groupId: string, index: number) {
  const s = strokeOf(groupId)
  if (!s) return ''
  if (s.phase === 'trace' && index === currentCell(groupId)) return 'honeycomb__cell--trace'
  if (s.phase === 'leave' && index === s.from) return 'honeycomb__cell--leave'
  if (s.phase === 'enter' && index === s.to) return 'honeycomb__cell--enter'
  return ''
}
</script>

<template>
  <div class="stack-logos w-full">
    <p class="mb-14 text-center font-mono text-sm uppercase tracking-[0.14em] text-dimmed sm:mb-16 md:mb-20">
      {{ title }}
    </p>

    <div class="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-20 xl:gap-x-24">
      <section
        v-for="(group, index) in displayGroups"
        :key="group.id"
        class="stack-logos__group flex w-full flex-col items-center px-1 sm:px-4"
        :class="index === displayGroups.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''"
      >
        <h3 class="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80 sm:mb-10">
          <span class="size-1 rounded-full bg-primary shadow-[0_0_6px_var(--ui-primary)]" />
          {{ group.title }}
        </h3>

        <div class="honeycomb">
          <!-- Ponte: traço saindo de uma colmeia e invadindo a próxima -->
          <svg
            class="honeycomb__bridges"
            viewBox="0 0 420 320"
            aria-hidden="true"
          >
            <path
              v-if="strokeOf(group.id)?.phase === 'bridge' || strokeOf(group.id)?.phase === 'enter'"
              :key="`${group.id}-bridge-${strokeOf(group.id)?.from}-${strokeOf(group.id)?.to}-${strokeOf(group.id)?.phase}`"
              class="honeycomb__bridge"
              :class="{
                'honeycomb__bridge--draw': strokeOf(group.id)?.phase === 'bridge',
                'honeycomb__bridge--fade': strokeOf(group.id)?.phase === 'enter'
              }"
              :d="bridgePath(group.id)"
              fill="none"
              :stroke="bridgeColor(group.id, displayGroups)"
              pathLength="100"
              @animationend="onBridgeEnd(group.id)"
            />
          </svg>

          <div
            v-for="(row, rowIndex) in honeycombRows(group.items)"
            :key="`${group.id}-row-${rowIndex}`"
            class="honeycomb__row"
            :class="{ 'honeycomb__row--offset': rowIndex % 2 === 1 }"
          >
            <div
              v-for="(item, itemIndex) in row"
              :key="`${group.id}-${item.label}`"
              class="honeycomb__cell"
              :class="[
                {
                  'honeycomb__cell--active': active === cellKey(group.id, item.label),
                  'honeycomb__cell--dim': active && active !== cellKey(group.id, item.label),
                  'honeycomb__cell--open': active === cellKey(group.id, item.label)
                },
                flowClass(group.id, cellIndex(rowIndex, itemIndex))
              ]"
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
                <svg
                  class="honeycomb__ring"
                  viewBox="0 0 100 115.47"
                  aria-hidden="true"
                >
                  <polygon
                    class="honeycomb__ring-base"
                    :points="HEX_POINTS"
                    fill="none"
                    pathLength="100"
                  />
                  <polygon
                    v-if="showFlow(group.id, cellIndex(rowIndex, itemIndex))"
                    :key="`${group.id}-${cellIndex(rowIndex, itemIndex)}-${strokeOf(group.id)?.phase}-${strokeOf(group.id)?.cursor}`"
                    class="honeycomb__ring-flow"
                    :points="HEX_POINTS"
                    fill="none"
                    pathLength="100"
                    :stroke="item.color"
                    @animationend="(e: AnimationEvent) => {
                      const idx = cellIndex(rowIndex, itemIndex)
                      if (e.animationName.includes('trace')) onTraceEnd(group.id, idx)
                      else if (e.animationName.includes('leave')) onLeaveEnd(group.id, idx)
                      else if (e.animationName.includes('enter')) onEnterEnd(group.id, idx)
                    }"
                  />
                </svg>

                <UIcon
                  :name="item.icon"
                  class="honeycomb__icon"
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
.stack-logos__group {
  container-type: inline-size;
  container-name: stack-group;
}

.honeycomb {
  /* Fallback sem container query: cabe em ~viewport mobile. */
  --gap: 0.4rem;
  --hex: min(4.5rem, calc((100vw - 2.5rem - 3.5 * var(--gap)) / 4.5));
  --hex-h: calc(var(--hex) * 1.1547);
  --step: calc(var(--hex) + var(--gap));
  --row-pull: calc(var(--hex-h) * 0.25 - var(--gap) * 0.5);

  position: relative;
  display: flex;
  width: fit-content;
  max-width: 100%;
  flex-direction: column;
  align-items: center;
  margin-inline: auto;
}

@supports (width: 1cqi) {
  .honeycomb {
    --hex: min(4.5rem, calc((100cqi - 3.5 * var(--gap)) / 4.5));
  }
}

@container stack-group (min-width: 22rem) {
  .honeycomb {
    --gap: 0.55rem;
  }
}

@container stack-group (min-width: 28rem) {
  .honeycomb {
    --gap: 0.75rem;
    --hex: min(5rem, calc((100cqi - 3.5 * var(--gap)) / 4.5));
  }
}

@media (min-width: 640px) {
  .honeycomb {
    --gap: 0.9rem;
  }

  @supports (width: 1cqi) {
    .honeycomb {
      --hex: min(5rem, calc((100cqi - 3.5 * var(--gap)) / 4.5));
    }
  }

  @supports not (width: 1cqi) {
    .honeycomb {
      --hex: min(5rem, calc((100vw - 4rem - 3.5 * var(--gap)) / 4.5));
    }
  }
}

.honeycomb__bridges {
  position: absolute;
  inset: -10% -6%;
  z-index: 5;
  width: auto;
  height: auto;
  pointer-events: none;
  overflow: visible;
}

.honeycomb__bridge {
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.55;
  filter: drop-shadow(0 0 4px color-mix(in srgb, currentColor 40%, transparent));
}

.honeycomb__bridge--draw {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: stroke-bridge-draw 0.38s ease-in forwards;
}

.honeycomb__bridge--fade {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  animation: stroke-bridge-fade 0.28s ease-out forwards;
}

.honeycomb__row {
  display: flex;
  justify-content: center;
  gap: var(--gap);
  transform: translateX(calc(var(--step) / -4));
}

.honeycomb__row + .honeycomb__row {
  margin-top: calc(var(--row-pull) * -1);
}

.honeycomb__row--offset {
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
  gap: calc(var(--hex) * 0.04);
  padding: calc(var(--hex) * 0.08) calc(var(--hex) * 0.1) calc(var(--hex) * 0.12);
  isolation: isolate;
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
      color-mix(in srgb, var(--stack-color) 8%, #0a0d0a),
      #0a0d0a 55%
    );
  transition:
    transform 0.3s ease,
    background 0.3s ease;
}

.honeycomb__ring {
  position: absolute;
  inset: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.honeycomb__ring-base {
  stroke: color-mix(in oklch, white 14%, transparent);
  stroke-width: 1.35;
  stroke-linejoin: round;
}

.honeycomb__ring-flow {
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.7;
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--stack-color) 45%, transparent));
}

.honeycomb__cell--trace .honeycomb__ring-flow {
  stroke-dasharray: 14 86;
  animation: stroke-trace 1.2s linear forwards;
}

.honeycomb__cell--leave .honeycomb__ring-flow {
  stroke-dasharray: 14 86;
  animation: stroke-leave 0.32s ease-in forwards;
}

.honeycomb__cell--enter .honeycomb__ring-flow {
  stroke-dasharray: 14 86;
  animation: stroke-enter 0.36s ease-out forwards;
}

.honeycomb__icon {
  position: relative;
  z-index: 2;
  width: calc(var(--hex) * 0.4);
  height: calc(var(--hex) * 0.4);
  color: color-mix(in oklch, var(--ui-text-muted) 92%, transparent);
  filter: grayscale(1);
  transition:
    color 0.3s ease,
    filter 0.3s ease,
    transform 0.3s ease;
}

.honeycomb__label {
  position: relative;
  z-index: 2;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: max(6px, calc(var(--hex) * 0.145));
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
  background:
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--stack-color) 16%, #0a0d0a),
      #0a0d0a 60%
    );
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

@keyframes stroke-trace {
  from {
    stroke-dashoffset: 0;
    opacity: 0.45;
  }
  to {
    stroke-dashoffset: -100;
    opacity: 0.75;
  }
}

@keyframes stroke-leave {
  0% {
    stroke-dashoffset: -100;
    stroke-dasharray: 14 86;
    opacity: 0.75;
  }
  100% {
    stroke-dashoffset: -112;
    stroke-dasharray: 2 98;
    opacity: 0;
  }
}

@keyframes stroke-enter {
  0% {
    stroke-dashoffset: 8;
    stroke-dasharray: 2 98;
    opacity: 0;
  }
  35% {
    opacity: 0.7;
  }
  100% {
    stroke-dashoffset: 0;
    stroke-dasharray: 14 86;
    opacity: 0.55;
  }
}

@keyframes stroke-bridge-draw {
  from {
    stroke-dashoffset: 100;
    opacity: 0.2;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 0.65;
  }
}

@keyframes stroke-bridge-fade {
  from {
    stroke-dashoffset: 0;
    opacity: 0.55;
  }
  to {
    stroke-dashoffset: -40;
    opacity: 0;
  }
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

  .honeycomb__ring-flow,
  .honeycomb__bridge {
    animation: none !important;
    opacity: 0 !important;
  }

  .honeycomb__tip {
    animation: none;
  }
}
</style>
