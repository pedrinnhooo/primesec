<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const year = new Date().getFullYear()

const links = computed(() => [
  { label: t('nav.services'), to: `${localePath('index')}#features` },
  { label: t('nav.howWeWork'), to: `${localePath('index')}#metrics` },
  { label: t('nav.blog'), to: localePath('blog') },
  { label: t('nav.contact'), to: localePath('contato') }
])
</script>

<template>
  <UFooter
    :ui="{
      root: 'mt-auto',
      container: 'flex flex-col items-center gap-y-6 border-t border-default py-8 text-center sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-x-3 lg:py-10 lg:text-left',
      left: 'order-2 flex min-w-0 flex-col items-center gap-2.5 lg:order-1 lg:flex-1 lg:items-start lg:justify-start lg:mt-0',
      center: 'hidden',
      right: 'order-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 lg:order-3 lg:flex-1 lg:justify-end lg:mt-0'
    }"
  >
    <template #left>
      <NuxtLink
        :to="localePath('index')"
        class="primesec-brand-link w-fit"
        aria-label="SecFocus"
      >
        <AppBrand size="sm" />
      </NuxtLink>
      <p class="max-w-xs text-sm leading-relaxed text-muted sm:max-w-sm">
        {{ t('footer.tagline') }}
      </p>
      <p class="text-xs text-dimmed sm:text-sm">
        {{ t('footer.rights', { year }) }}
      </p>
    </template>

    <template #right>
      <UButton
        v-for="link in links"
        :key="link.label"
        :label="link.label"
        :to="link.to"
        color="neutral"
        variant="link"
        class="font-light"
        size="sm"
      />
    </template>
  </UFooter>
</template>
