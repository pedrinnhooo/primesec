<script setup lang="ts">
/**
 * Revela o conteúdo quando ele entra na viewport.
 *
 * A transição é 100% CSS
 * (`.primesec-reveal` em main.css) e o único JS é um IntersectionObserver,
 * mantendo a biblioteca de motion fora do bundle do caminho crítico.
 */
withDefaults(defineProps<{
  as?: string
  /** Atraso da transição, em segundos. */
  delay?: number
  /** `up` sobe 16px junto com o fade; `fade` só muda a opacidade. */
  variant?: 'up' | 'fade'
}>(), {
  as: 'div',
  delay: 0,
  variant: 'up'
})

const root = ref<HTMLElement>()
const revealed = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  const el = root.value
  if (!el) return

  // Revela quando o bloco está inteiro à vista, com um teto: blocos mais altos
  // que a viewport nunca atingiriam 100% de interseção.
  const ratio = Math.min(1, window.innerHeight / Math.max(el.offsetHeight, 1))

  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    revealed.value = true
    observer?.disconnect()
  }, { threshold: Math.max(ratio - 0.01, 0) })

  observer.observe(el)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="primesec-reveal"
    :class="[
      revealed && 'primesec-reveal--in',
      variant === 'fade' && 'primesec-reveal--fade'
    ]"
    :style="{ '--reveal-delay': `${delay}s` }"
  >
    <slot />
  </component>
</template>
