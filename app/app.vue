<script setup lang="ts">
const colorMode = useColorMode()
const { localeProperties } = useI18n()

const color = computed(() => colorMode.value === 'dark' ? '#09090b' : 'white')

const i18nHead = useLocaleHead({
  seo: true
})

useHead(() => ({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color.value },
    ...(i18nHead.value.meta || [])
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ...(i18nHead.value.link || [])
  ],
  // Sem JS nada dispara o reveal nem esconde a tela de carregamento.
  noscript: [
    {
      innerHTML: '<style>.primesec-reveal{opacity:1;transform:none}.primesec-hold .primesec-enter{animation-play-state:running}#globe-loader{display:none}</style>'
    }
  ],
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang || localeProperties.value.language || 'pt-BR',
    dir: i18nHead.value.htmlAttrs?.dir || 'ltr'
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} · SecFocus` : 'SecFocus'
  }
}))

useSeoMeta({
  twitterCard: 'summary_large_image',
  ogType: 'website',
  ogSiteName: 'SecFocus'
})
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <AppHeader />

    <UMain>
      <NuxtPage />
    </UMain>

    <LazyAppFooter hydrate-on-visible />
  </UApp>
</template>
