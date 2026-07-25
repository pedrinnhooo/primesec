<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#09090b' : 'white')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ],
  // Sem JS nada dispara o reveal nem esconde a tela de carregamento.
  noscript: [
    {
      innerHTML: '<style>.primesec-reveal{opacity:1;transform:none}.primesec-hold .primesec-enter{animation-play-state:running}#globe-loader{display:none}</style>'
    }
  ],
  htmlAttrs: {
    lang: 'pt-BR'
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} · PrimeSec` : 'PrimeSec'
  }
})

useSeoMeta({
  twitterCard: 'summary_large_image',
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogSiteName: 'PrimeSec'
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
