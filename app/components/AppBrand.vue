<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md'
}>(), {
  size: 'md'
})
</script>

<template>
  <span
    class="primesec-brand"
    :class="`primesec-brand--${size}`"
  >
    <AppLogo class="primesec-brand__logo" />
    <span
      class="primesec-brand__name"
      aria-hidden="true"
    >PrimeSec</span>
  </span>
</template>
