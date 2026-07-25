<script setup lang="ts">
interface TerminalSegment {
  text: string
  style: string
}

interface TerminalLine {
  segments: TerminalSegment[]
}

defineProps<{
  lines: TerminalLine[]
}>()

const segmentStyles: Record<string, string> = {
  'prompt': 'text-muted',
  'cmd': 'text-highlighted',
  'flag': 'text-primary',
  'dim': 'text-muted',
  'success': 'text-success',
  'url': 'text-info',
  'metric-good': 'text-primary'
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-default bg-elevated/50 backdrop-blur ring-1 ring-white/2">
    <div class="flex items-center gap-1.5 border-b border-default p-4 sm:px-6">
      <span class="size-2.5 rounded-full border border-default bg-muted" />
      <span class="size-2.5 rounded-full border border-default bg-muted" />
      <span class="size-2.5 rounded-full border border-default bg-muted" />
    </div>

    <div class="min-h-[200px] p-5 font-mono text-[13px] leading-[1.8] sm:p-6">
      <div
        v-for="(line, lineIndex) in lines"
        :key="lineIndex"
        class="primesec-enter primesec-enter--terminal"
        :style="{ '--enter-delay': `${1.4 + lineIndex * 0.4}s` }"
      >
        <span
          v-for="(segment, segIndex) in line.segments"
          :key="segIndex"
          :class="segmentStyles[segment.style]"
        >
          {{ segment.text }}
        </span>
      </div>
    </div>
  </div>
</template>
