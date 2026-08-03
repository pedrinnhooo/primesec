<script setup lang="ts">
import { CONTACT_EMAIL } from '#shared/constants/contact'

definePageMeta({
  colorMode: 'dark'
})

defineI18nRoute({
  paths: {
    pt: '/contato',
    en: '/contact',
    es: '/contacto'
  }
})

defineRouteRules({
  prerender: true
})

const { t } = useI18n()

const title = computed(() => t('contact.seo.title'))
const description = computed(() => t('contact.seo.description'))

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const email = CONTACT_EMAIL
const { copy, copied } = useClipboard()

const channels = computed(() => [
  { label: t('contact.channels.canal'), value: email, action: 'copy' as const },
  { label: t('contact.channels.sla'), value: t('contact.channels.slaValue') },
  { label: t('contact.channels.frentes'), value: t('contact.channels.frentesValue') }
])
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Galáxia + attacks (continuidade visual com o globo da Home) -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(80vh,44rem)] overflow-hidden"
      style="-webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%);"
    >
      <LazyGalaxyBanner
        class="absolute inset-0"
        palette="green"
        density="medium"
        hydrate-on-idle
      />
      <GradientGlow class="top-0 left-1/4 w-3/5 h-[55%] opacity-35" />
      <div
        class="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_80%_55%_at_top,color-mix(in_oklch,var(--ui-primary)_4%,transparent)_0%,color-mix(in_oklch,var(--ui-primary)_1.5%,transparent)_40%,transparent_75%)]"
        aria-hidden="true"
      />
      <div class="absolute inset-x-0 bottom-0 h-56 sm:h-72 bg-linear-to-t from-(--ui-bg) from-5% via-(--ui-bg)/70 via-45% to-transparent" />
    </div>

    <UPageSection
      :ui="{
        root: 'relative z-10 pt-20 pb-20 sm:pt-10 sm:pb-28',
        container: 'max-w-4xl'
      }"
    >
      <!-- Hero editorial: uma composição, sem coluna apertada -->
      <div class="flex flex-col items-start">
        <div
          class="primesec-enter flex w-full justify-center sm:w-auto sm:justify-start"
          style="--enter-delay: 0.1s"
        >
          <UBadge
            color="neutral"
            variant="soft"
            :label="t('contact.badge')"
            class="rounded-full px-3 py-1.5 gap-1.5 bg-white/5 backdrop-blur"
          >
            <template #leading>
              <UChip
                inset
                standalone
                :ui="{ base: 'animate-pulse ring-0' }"
              />
            </template>
          </UBadge>
        </div>

        <h1
          class="primesec-enter mt-7 w-full max-w-3xl text-center sm:w-auto sm:text-left text-5xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] text-highlighted"
          style="--enter-delay: 0.22s"
        >
          {{ t('contact.titlePrimary') }}
          <br>
          <span
            class="animate-shimmer bg-size-[200%_auto] bg-clip-text text-transparent"
            :style="{
              backgroundImage: 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-300), var(--color-primary-200), var(--color-primary-100), var(--color-primary-200), var(--color-primary-300), var(--color-primary-400))',
              animationDuration: '10s'
            }"
          >
            {{ t('contact.titleSecondary') }}
          </span>
        </h1>

        <p
          class="primesec-enter mt-6 w-full max-w-xl text-center sm:w-auto sm:text-left text-lg sm:text-lg leading-relaxed text-dimmed"
          style="--enter-delay: 0.36s"
        >
          {{ t('contact.description') }}
        </p>

        <!-- Status strip: terminal, não checklist genérico -->
        <div
          class="primesec-enter mt-10 w-full overflow-hidden rounded-xl border border-white/10 bg-default/40 backdrop-blur"
          style="--enter-delay: 0.48s"
        >
          <div class="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
            <span class="size-2 rounded-full bg-primary/80 shadow-[0_0_8px_var(--ui-primary)]" />
            <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-dimmed">
              {{ t('contact.session') }}
            </span>
          </div>
          <div class="grid gap-px sm:grid-cols-3">
            <div
              v-for="channel in channels"
              :key="channel.label"
              class="flex flex-col gap-1.5 bg-default/50 px-4 py-4 sm:px-5"
            >
              <span class="font-mono text-[11px] uppercase tracking-[0.14em] text-primary/80">
                {{ channel.label }}
              </span>
              <button
                v-if="channel.action === 'copy'"
                type="button"
                class="group inline-flex items-center gap-2 text-left text-sm font-medium tracking-tight text-highlighted transition-colors hover:text-primary"
                @click="copy(email)"
              >
                <span class="font-mono font-light truncate">{{ channel.value }}</span>
                <UIcon
                  :name="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                  class="size-3.5 shrink-0 text-dimmed transition-colors group-hover:text-primary"
                />
              </button>
              <span
                v-else
                class="text-sm font-medium tracking-tight text-highlighted"
              >
                {{ channel.value }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulário: peça principal, sem card genérico -->
      <div
        class="primesec-enter relative mt-12 sm:mt-14"
        style="--enter-delay: 0.58s"
      >
        <div
          class="pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-b from-primary/20 via-white/5 to-transparent opacity-60"
          aria-hidden="true"
        />
        <div class="relative rounded-2xl border border-white/10 bg-default/55 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
          <div class="mb-8 flex items-end justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <p class="font-mono text-xs uppercase tracking-[0.14em] text-primary">
                {{ t('contact.formEyebrow') }}
              </p>
              <p class="mt-2 text-sm text-dimmed">
                {{ t('contact.formHint') }}
              </p>
            </div>
            <span class="hidden font-mono text-xs text-dimmed sm:inline">
              POST /contact
            </span>
          </div>

          <ContactForm />
        </div>
      </div>
    </UPageSection>
  </div>
</template>
