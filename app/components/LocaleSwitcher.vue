<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const open = ref(false)
const button = ref<HTMLElement>()
const menu = ref<HTMLElement>()
const menuStyle = ref<Record<string, string>>({})

const FLAG_SRC: Record<string, string> = {
  pt: '/flags/br.svg',
  en: '/flags/us.svg',
  es: '/flags/es.svg'
}

const options = computed(() =>
  locales.value.map((item) => {
    const code = typeof item === 'string' ? item : item.code
    const name = typeof item === 'string' ? item : (item.name || code)
    return {
      code,
      name,
      short: t(`locale.codes.${code}` as 'locale.codes.pt'),
      flagSrc: FLAG_SRC[code] || FLAG_SRC.pt!,
      active: code === locale.value,
      to: switchLocalePath(code)
    }
  })
)

const current = computed(() =>
  options.value.find(option => option.active) || options.value[0]!
)

function placeMenu() {
  const el = button.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const gap = 18
  menuStyle.value = {
    position: 'fixed',
    top: `${Math.round(rect.bottom + gap)}px`,
    right: `${Math.round(window.innerWidth - rect.right)}px`,
    left: 'auto'
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(placeMenu)
  }
}

function close() {
  open.value = false
}

function onSelect() {
  close()
}

function onPointerDown(event: PointerEvent) {
  if (!open.value) return
  const target = event.target as Node | null
  if (target && (button.value?.contains(target) || menu.value?.contains(target))) return
  close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

function onViewportChange() {
  if (open.value) placeMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onViewportChange, { passive: true })
  window.addEventListener('scroll', onViewportChange, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange)
})
</script>

<template>
  <div class="primesec-locale-wrap">
    <button
      ref="button"
      type="button"
      class="primesec-locale"
      :aria-label="t('locale.switch', { current: current.short })"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="toggle"
    >
      <img
        class="primesec-locale__flag"
        :src="current.flagSrc"
        alt=""
        aria-hidden="true"
        draggable="false"
      >
      <span
        class="primesec-locale__wash"
        aria-hidden="true"
      />
      <span class="primesec-locale__code">{{ current.short }}</span>
    </button>

    <Teleport to="body">
      <Transition name="primesec-locale-menu">
        <div
          v-if="open"
          ref="menu"
          class="primesec-locale-menu"
          role="listbox"
          :aria-label="t('locale.switch', { current: current.short })"
          :style="menuStyle"
        >
          <NuxtLink
            v-for="option in options"
            :key="option.code"
            :to="option.to"
            class="primesec-locale-menu__item"
            :class="{ 'primesec-locale-menu__item--active': option.active }"
            role="option"
            :aria-selected="option.active"
            @click="onSelect"
          >
            <img
              class="primesec-locale-menu__flag"
              :src="option.flagSrc"
              alt=""
              aria-hidden="true"
              draggable="false"
            >
            <span class="primesec-locale-menu__meta">
              <span class="primesec-locale-menu__code">{{ option.short }}</span>
              <span class="primesec-locale-menu__name">{{ option.name }}</span>
            </span>
          </NuxtLink>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
