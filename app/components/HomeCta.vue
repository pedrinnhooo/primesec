<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  command: string
  // Tipagem frouxa: vem do content e é repassada ao UButton.
  links: Array<Record<string, unknown>>
}>()

const { copy, copied } = useClipboard()
</script>

<template>
  <UPageCTA
    variant="naked"
    :ui="{
      root: 'pt-0 pb-10 sm:pt-2 sm:pb-12',
      container: 'max-w-3xl text-center',
      title: 'lg:text-5xl tracking-tighter whitespace-pre-line',
      description: 'mx-auto max-w-sm leading-relaxed text-dimmed'
    }"
  >
    <template #top>
      <GradientGlow class="bottom-0 w-2/3 h-1/2" />
    </template>

    <template #title>
      <Motion
        as="span"
        v-bind="scrollMotion()"
        class="inline-block"
      >
        {{ title }}
      </Motion>
    </template>

    <template #description>
      <Motion
        as="span"
        v-bind="scrollMotion(0.1)"
        class="inline-block"
      >
        {{ description }}
      </Motion>
    </template>

    <template #links>
      <Motion
        class="flex flex-col items-center justify-center gap-6"
        v-bind="scrollMotion(0.2)"
      >
        <UButton
          v-for="link in links"
          :key="String(link.label)"
          v-bind="link"
          size="xl"
        />

        <UButton
          :label="command"
          :trailing-icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          color="neutral"
          variant="subtle"
          class="font-mono font-light text-toned gap-4"
          size="xl"
          :ui="{ trailingIcon: 'size-5' }"
          @click="copy(props.command)"
        />
      </Motion>
    </template>
  </UPageCTA>
</template>
