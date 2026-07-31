<script setup lang="ts">
import {
  edgePath,
  SERVICE_ARCHITECTURES,
  type ServiceId
} from '~/utils/service-architectures'

const props = defineProps<{
  serviceId: ServiceId
  labels: string[]
  /** Muda para reiniciar a animação de desenho. */
  playKey: number
}>()

const layout = computed(() => SERVICE_ARCHITECTURES[props.serviceId])

const nodeMap = computed(() => {
  const map = new Map<string, (typeof layout.value.nodes)[number]>()
  for (const node of layout.value.nodes) map.set(node.id, node)
  return map
})

const edges = computed(() =>
  layout.value.edges.flatMap((edge, index) => {
    const from = nodeMap.value.get(edge.from)
    const to = nodeMap.value.get(edge.to)
    if (!from || !to) return []
    return [{
      key: `${edge.from}-${edge.to}-${index}`,
      d: edgePath(from, to, edge.bend),
      delay: 0.35 + index * 0.18
    }]
  })
)

const toneClass: Record<string, string> = {
  primary: 'stroke-primary/80 fill-primary/10',
  muted: 'stroke-white/25 fill-white/[0.04]',
  danger: 'stroke-red-400/70 fill-red-400/10',
  info: 'stroke-sky-400/70 fill-sky-400/10'
}

const toneText: Record<string, string> = {
  primary: 'fill-primary',
  muted: 'fill-white/70',
  danger: 'fill-red-300',
  info: 'fill-sky-300'
}

function labelFor(index: number) {
  return props.labels[index] ?? `N${index + 1}`
}
</script>

<template>
  <div
    :key="playKey"
    class="service-arch relative overflow-hidden rounded-xl border border-white/10 bg-[#070a07]"
  >
    <!-- Blueprint grid -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.35]"
      style="background-image:
        linear-gradient(color-mix(in oklch, var(--ui-primary) 18%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in oklch, var(--ui-primary) 18%, transparent) 1px, transparent 1px);
        background-size: 28px 28px;"
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-40"
      style="background: radial-gradient(ellipse 70% 60% at 50% 40%, color-mix(in oklch, var(--ui-primary) 12%, transparent), transparent 70%);"
    />

    <!-- Scan sweep while drawing -->
    <div class="service-arch__scan pointer-events-none absolute inset-y-0 w-1/3" />

    <svg
      class="relative z-10 h-auto w-full"
      viewBox="0 0 1000 560"
      role="img"
      :aria-label="serviceId"
    >
      <defs>
        <marker
          id="arch-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 1.5 L 8 5 L 0 8.5 Z"
            class="fill-primary/80"
          />
        </marker>
        <filter id="arch-glow">
          <feGaussianBlur
            stdDeviation="2.5"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Edges draw first -->
      <g
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          v-for="edge in edges"
          :key="edge.key"
          :d="edge.d"
          pathLength="1"
          class="service-arch__edge stroke-primary/55"
          stroke-width="2"
          marker-end="url(#arch-arrow)"
          :style="{ '--arch-delay': `${edge.delay}s` }"
        />
        <!-- Flow dots after lines exist -->
        <circle
          v-for="edge in edges"
          :key="`${edge.key}-dot`"
          r="3.5"
          class="fill-primary service-arch__packet"
          filter="url(#arch-glow)"
          :style="{ '--arch-delay': `${edge.delay + 0.7}s` }"
        >
          <animateMotion
            :path="edge.d"
            :begin="`${edge.delay + 0.7}s`"
            dur="1.6s"
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      </g>

      <!-- Nodes materialize -->
      <g
        v-for="(node, index) in layout.nodes"
        :key="node.id"
        class="service-arch__node"
        :style="{ '--arch-delay': `${0.15 + index * 0.12}s` }"
      >
        <rect
          :x="node.x - node.w / 2"
          :y="node.y - node.h / 2"
          :width="node.w"
          :height="node.h"
          rx="10"
          pathLength="1"
          class="service-arch__box"
          :class="toneClass[node.tone || 'muted']"
          stroke-width="1.75"
        />
        <!-- Corner ticks (tech feel) -->
        <path
          :d="`M ${node.x - node.w / 2 + 8} ${node.y - node.h / 2 + 2}
               V ${node.y - node.h / 2 + 10}
               M ${node.x - node.w / 2 + 2} ${node.y - node.h / 2 + 8}
               H ${node.x - node.w / 2 + 10}`"
          class="stroke-primary/50"
          stroke-width="1.25"
          fill="none"
        />
        <text
          :x="node.x"
          :y="node.y + 1"
          text-anchor="middle"
          dominant-baseline="middle"
          class="service-arch__label"
          :class="toneText[node.tone || 'muted']"
          font-family="IBM Plex Mono, ui-monospace, monospace"
          font-size="13"
          letter-spacing="0.04em"
        >
          {{ labelFor(node.label) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.service-arch__scan {
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklch, var(--ui-primary) 22%, transparent),
    transparent
  );
  animation: service-arch-scan 2.4s ease-in-out 1;
  animation-fill-mode: forwards;
}

.service-arch__edge {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: service-arch-draw 0.85s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: var(--arch-delay, 0s);
}

.service-arch__box {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation:
    service-arch-draw 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards,
    service-arch-fill 0.5s ease forwards;
  animation-delay: var(--arch-delay, 0s), calc(var(--arch-delay, 0s) + 0.35s);
}

.service-arch__label {
  opacity: 0;
  animation: service-arch-fade 0.45s ease forwards;
  animation-delay: calc(var(--arch-delay, 0s) + 0.4s);
}

.service-arch__node {
  transform-box: fill-box;
  transform-origin: center;
}

.service-arch__packet {
  opacity: 0;
  animation: service-arch-fade 0.3s ease forwards;
  animation-delay: var(--arch-delay, 0s);
}

@keyframes service-arch-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes service-arch-fill {
  from {
    fill-opacity: 0;
  }
  to {
    fill-opacity: 1;
  }
}

@keyframes service-arch-fade {
  to {
    opacity: 1;
  }
}

@keyframes service-arch-scan {
  0% {
    left: -30%;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    left: 110%;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-arch__edge,
  .service-arch__box,
  .service-arch__label,
  .service-arch__packet,
  .service-arch__scan {
    animation: none !important;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>
