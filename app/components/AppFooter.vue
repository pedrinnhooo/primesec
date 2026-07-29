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
      container: 'border-t border-default gap-y-5 py-6 sm:py-8 lg:py-8',
      left: 'min-w-0',
      right: 'gap-x-1 gap-y-1 flex-wrap justify-start sm:justify-end'
    }"
  >
    <template #left>
      <div class="flex min-w-0 flex-col gap-2.5">
        <NuxtLink
          :to="localePath('index')"
          class="primesec-brand-link w-fit"
          aria-label="PrimeSec"
        >
          <AppBrand size="sm" />
        </NuxtLink>
        <p class="text-xs text-dimmed sm:text-sm">
          {{ t('footer.rights', { year }) }}
        </p>
      </div>
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
