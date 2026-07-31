<script setup lang="ts">
import type { MetricId } from '~/utils/metric-themes'

const props = defineProps<{
  metricId: MetricId
  labels: string[]
  playKey: number
}>()

function label(index: number, fallback: string) {
  return props.labels[index] ?? fallback
}
</script>

<template>
  <div
    :key="playKey"
    class="metric-illu relative overflow-hidden rounded-xl border border-white/10 bg-[#070a07]"
  >
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
    <div class="metric-illu__scan pointer-events-none absolute inset-y-0 w-1/3" />

    <svg
      class="relative z-10 h-auto w-full"
      viewBox="0 0 1000 560"
      role="img"
      :aria-label="metricId"
    >
      <defs>
        <filter id="metric-glow">
          <feGaussianBlur
            stdDeviation="2.5"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker
          id="metric-arrow"
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
      </defs>

      <!-- 2 departamentos: pilares ligados -->
      <g v-if="metricId === 'departments'">
        <g
          class="metric-illu__node"
          style="--illu-delay: 0.15s"
        >
          <rect
            x="110"
            y="110"
            width="280"
            height="340"
            rx="16"
            pathLength="1"
            class="metric-illu__box stroke-emerald-400/70 fill-emerald-400/10"
            stroke-width="1.75"
          />
          <circle
            cx="250"
            cy="210"
            r="36"
            class="stroke-emerald-400/80 fill-emerald-400/15"
            stroke-width="1.5"
          />
          <path
            d="M250 192 v36 M232 210 h36"
            class="stroke-emerald-300"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <text
            x="250"
            y="290"
            text-anchor="middle"
            class="fill-emerald-300"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="18"
            letter-spacing="0.06em"
          >
            {{ label(0, 'Engenharia') }}
          </text>
          <text
            x="250"
            y="322"
            text-anchor="middle"
            class="fill-white/45"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="12"
            letter-spacing="0.08em"
          >
            {{ label(1, 'Software') }}
          </text>
        </g>

        <g
          class="metric-illu__node"
          style="--illu-delay: 0.35s"
        >
          <rect
            x="610"
            y="110"
            width="280"
            height="340"
            rx="16"
            pathLength="1"
            class="metric-illu__box stroke-sky-400/70 fill-sky-400/10"
            stroke-width="1.75"
          />
          <circle
            cx="750"
            cy="210"
            r="36"
            class="stroke-sky-400/80 fill-sky-400/15"
            stroke-width="1.5"
          />
          <path
            d="M735 222 l15-28 15 28z M735 210 h30"
            class="stroke-sky-300"
            stroke-width="2"
            fill="none"
            stroke-linejoin="round"
          />
          <text
            x="750"
            y="290"
            text-anchor="middle"
            class="fill-sky-300"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="18"
            letter-spacing="0.06em"
          >
            {{ label(2, 'Segurança') }}
          </text>
          <text
            x="750"
            y="322"
            text-anchor="middle"
            class="fill-white/45"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="12"
            letter-spacing="0.08em"
          >
            {{ label(3, 'da Informação') }}
          </text>
        </g>

        <!-- Bridge -->
        <g
          class="metric-illu__node"
          style="--illu-delay: 0.55s"
        >
          <path
            d="M390 280 H430"
            pathLength="1"
            class="metric-illu__edge stroke-primary/60"
            stroke-width="2"
            fill="none"
            marker-end="url(#metric-arrow)"
            style="--illu-delay: 0.55s"
          />
          <path
            d="M570 280 H610"
            pathLength="1"
            class="metric-illu__edge stroke-primary/60"
            stroke-width="2"
            fill="none"
            marker-end="url(#metric-arrow)"
            style="--illu-delay: 0.65s"
          />
          <rect
            x="430"
            y="248"
            width="140"
            height="64"
            rx="10"
            pathLength="1"
            class="metric-illu__box stroke-primary/70 fill-primary/10"
            stroke-width="1.5"
          />
          <text
            x="500"
            y="286"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-primary"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="14"
            letter-spacing="0.12em"
          >
            {{ label(4, 'PrimeSec') }}
          </text>
        </g>
      </g>

      <!-- 12 linhas de serviço: grade -->
      <g v-else-if="metricId === 'services'">
        <g
          v-for="ri in [0, 1, 2]"
          :key="`row-${ri}`"
        >
          <g
            v-for="ci in [0, 1, 2, 3]"
            :key="`cell-${ri}-${ci}`"
            class="metric-illu__node"
            :style="{ '--illu-delay': `${0.12 + (ri * 4 + ci) * 0.07}s` }"
          >
            <rect
              :x="80 + ci * 220"
              :y="70 + ri * 150"
              width="190"
              height="110"
              rx="12"
              pathLength="1"
              class="metric-illu__box stroke-primary/55 fill-primary/[0.07]"
              stroke-width="1.5"
            />
            <circle
              :cx="110 + ci * 220"
              :cy="105 + ri * 150"
              r="8"
              class="fill-primary"
              filter="url(#metric-glow)"
            />
            <text
              :x="175 + ci * 220"
              :y="130 + ri * 150"
              text-anchor="middle"
              class="fill-white/75"
              font-family="IBM Plex Mono, ui-monospace, monospace"
              font-size="13"
              letter-spacing="0.04em"
            >
              {{ label(ri * 4 + ci, `S${ri * 4 + ci + 1}`) }}
            </text>
          </g>
        </g>
      </g>

      <!-- SI: ofensiva / defensiva / GRC -->
      <g v-else-if="metricId === 'security'">
        <!-- Outer shield -->
        <g
          class="metric-illu__node"
          style="--illu-delay: 0.1s"
        >
          <path
            d="M500 70 L780 160 V300 C780 420 640 500 500 530 C360 500 220 420 220 300 V160 Z"
            pathLength="1"
            class="metric-illu__box stroke-white/20 fill-white/[0.03]"
            stroke-width="1.5"
          />
        </g>

        <!-- Offensive -->
        <g
          class="metric-illu__node"
          style="--illu-delay: 0.3s"
        >
          <rect
            x="280"
            y="180"
            width="200"
            height="120"
            rx="12"
            pathLength="1"
            class="metric-illu__box stroke-red-400/70 fill-red-400/10"
            stroke-width="1.75"
          />
          <text
            x="380"
            y="235"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-red-300"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="16"
            letter-spacing="0.06em"
          >
            {{ label(0, 'Ofensiva') }}
          </text>
          <text
            x="380"
            y="262"
            text-anchor="middle"
            class="fill-white/40"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="11"
          >
            {{ label(1, 'Red · Pentest') }}
          </text>
        </g>

        <!-- Defensive -->
        <g
          class="metric-illu__node"
          style="--illu-delay: 0.45s"
        >
          <rect
            x="520"
            y="180"
            width="200"
            height="120"
            rx="12"
            pathLength="1"
            class="metric-illu__box stroke-sky-400/70 fill-sky-400/10"
            stroke-width="1.75"
          />
          <text
            x="620"
            y="235"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-sky-300"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="16"
            letter-spacing="0.06em"
          >
            {{ label(2, 'Defensiva') }}
          </text>
          <text
            x="620"
            y="262"
            text-anchor="middle"
            class="fill-white/40"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="11"
          >
            {{ label(3, 'Blue · Purple') }}
          </text>
        </g>

        <!-- GRC -->
        <g
          class="metric-illu__node"
          style="--illu-delay: 0.6s"
        >
          <rect
            x="360"
            y="340"
            width="280"
            height="100"
            rx="12"
            pathLength="1"
            class="metric-illu__box stroke-violet-400/70 fill-violet-400/10"
            stroke-width="1.75"
          />
          <text
            x="500"
            y="385"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-violet-300"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="16"
            letter-spacing="0.06em"
          >
            {{ label(4, 'GRC') }}
          </text>
          <text
            x="500"
            y="412"
            text-anchor="middle"
            class="fill-white/40"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="11"
          >
            {{ label(5, 'Governança · LGPD') }}
          </text>
        </g>

        <path
          d="M380 300 V340 M620 300 V340"
          pathLength="1"
          class="metric-illu__edge stroke-white/25"
          stroke-width="1.5"
          fill="none"
          style="--illu-delay: 0.7s"
        />
      </g>

      <!-- E2E: pipeline produto → compliance -->
      <g v-else>
        <g
          v-for="(stage, index) in 5"
          :key="`stage-${index}`"
          class="metric-illu__node"
          :style="{ '--illu-delay': `${0.15 + index * 0.14}s` }"
        >
          <rect
            :x="60 + index * 185"
            y="200"
            width="150"
            height="140"
            rx="14"
            pathLength="1"
            class="metric-illu__box"
            :class="index === 4
              ? 'stroke-amber-400/70 fill-amber-400/10'
              : index === 0
                ? 'stroke-emerald-400/70 fill-emerald-400/10'
                : 'stroke-primary/55 fill-primary/[0.07]'"
            stroke-width="1.75"
          />
          <circle
            :cx="135 + index * 185"
            :cy="245"
            r="14"
            class="fill-primary/80"
            filter="url(#metric-glow)"
          />
          <text
            :x="135 + index * 185"
            :y="250"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-[#070a07]"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="12"
            font-weight="700"
          >
            {{ index + 1 }}
          </text>
          <text
            :x="135 + index * 185"
            :y="295"
            text-anchor="middle"
            class="fill-white/80"
            font-family="IBM Plex Mono, ui-monospace, monospace"
            font-size="13"
            letter-spacing="0.04em"
          >
            {{ label(index, `Etapa ${index + 1}`) }}
          </text>
        </g>

        <path
          v-for="i in 4"
          :key="`arrow-${i}`"
          :d="`M${210 + (i - 1) * 185} 270 H${245 + (i - 1) * 185}`"
          pathLength="1"
          class="metric-illu__edge stroke-primary/55"
          stroke-width="2"
          fill="none"
          marker-end="url(#metric-arrow)"
          :style="{ '--illu-delay': `${0.35 + i * 0.12}s` }"
        />

        <text
          x="500"
          y="120"
          text-anchor="middle"
          class="fill-white/40 metric-illu__node"
          style="--illu-delay: 0.05s"
          font-family="IBM Plex Mono, ui-monospace, monospace"
          font-size="13"
          letter-spacing="0.16em"
        >
          {{ label(5, 'ENTREGA CONTÍNUA') }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.metric-illu__scan {
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklch, var(--ui-primary) 22%, transparent),
    transparent
  );
  animation: metric-illu-scan 2.4s ease-in-out 1;
  animation-fill-mode: forwards;
}

.metric-illu__box {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: metric-illu-draw 0.9s ease forwards;
  animation-delay: var(--illu-delay, 0s);
}

.metric-illu__node {
  opacity: 0;
  animation: metric-illu-fade 0.55s ease forwards;
  animation-delay: var(--illu-delay, 0s);
}

.metric-illu__edge {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  animation:
    metric-illu-draw 0.8s ease forwards,
    metric-illu-fade 0.4s ease forwards;
  animation-delay: var(--illu-delay, 0s);
}

@keyframes metric-illu-scan {
  0% { transform: translateX(-40%); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(340%); opacity: 0; }
}

@keyframes metric-illu-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes metric-illu-fade {
  to { opacity: 1; }
}
</style>
