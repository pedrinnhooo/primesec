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
  <div class="relative overflow-hidden">
    <!-- Galáxia fluida (sem attacks) — mesma linguagem do banner Blog/Contato -->
    <div
      class="pointer-events-none absolute inset-x-0 inset-y-0 z-0 overflow-hidden"
      style="-webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 28%, #000 100%); mask-image: linear-gradient(to bottom, transparent 0%, #000 28%, #000 100%);"
    >
      <LazyGalaxyBanner
        class="absolute inset-0"
        palette="green"
        density="medium"
        :attacks="false"
        hydrate-on-idle
      />
      <GradientGlow class="bottom-0 w-2/3 h-1/2 opacity-50" />
      <div class="absolute inset-x-0 top-0 h-40 sm:h-52 bg-linear-to-b from-(--ui-bg) from-5% via-(--ui-bg)/70 via-45% to-transparent" />
    </div>

    <UPageCTA
      variant="naked"
      :ui="{
        root: 'relative z-10 pt-0 pb-10 sm:pt-2 sm:pb-12',
        container: 'max-w-3xl text-center',
        title: 'lg:text-5xl tracking-tighter whitespace-pre-line',
        description: 'mx-auto max-w-sm leading-relaxed text-dimmed'
      }"
    >
      <template #title>
        <ScrollReveal
          as="span"
          class="inline-block"
        >
          {{ title }}
        </ScrollReveal>
      </template>

      <template #description>
        <ScrollReveal
          as="span"
          :delay="0.1"
          class="inline-block"
        >
          {{ description }}
        </ScrollReveal>
      </template>

      <template #links>
        <ScrollReveal
          class="flex flex-col items-center justify-center gap-6"
          :delay="0.2"
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
        </ScrollReveal>
      </template>
    </UPageCTA>
  </div>
</template>
