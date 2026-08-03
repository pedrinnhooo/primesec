<script setup lang="ts">
import type { ServiceDetail, ServiceId } from '~/utils/service-architectures'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  service: ServiceDetail | null
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const playKey = ref(0)
const statusReady = ref(false)
let statusTimer: ReturnType<typeof setTimeout> | null = null

watch(open, (isOpen) => {
  if (statusTimer) {
    clearTimeout(statusTimer)
    statusTimer = null
  }
  if (isOpen && props.service) {
    playKey.value += 1
    statusReady.value = false
    statusTimer = setTimeout(() => {
      statusReady.value = true
    }, 2400)
  }
})

watch(() => props.service?.id, () => {
  if (open.value) {
    playKey.value += 1
    statusReady.value = false
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = setTimeout(() => {
      statusReady.value = true
    }, 2400)
  }
})

onBeforeUnmount(() => {
  if (statusTimer) clearTimeout(statusTimer)
})

function close() {
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      overlay: 'bg-black/70 backdrop-blur-sm',
      content: 'bg-[#080b08] ring ring-white/10 divide-y divide-white/10 w-[min(96vw,56rem)] max-h-[min(92vh,44rem)] overflow-hidden',
      header: 'bg-transparent p-5 sm:px-8 sm:py-7',
      body: 'bg-transparent p-5 sm:p-8 overflow-y-auto',
      footer: 'bg-transparent p-5 sm:px-8 sm:py-5'
    }"
  >
    <template
      v-if="service"
      #header
    >
      <div class="flex min-w-0 flex-1 items-start gap-4 pr-10 sm:gap-5">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/25 sm:size-12">
          <UIcon
            :name="service.icon"
            class="size-5 text-primary sm:size-6"
          />
        </div>
        <div class="min-w-0">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/80">
            secfocus · {{ t('home.features.modal.blueprint') }} / {{ service.id }}
          </p>
          <h2 class="mt-1.5 text-lg font-semibold tracking-tight text-highlighted sm:text-xl">
            {{ service.title }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-dimmed">
            {{ service.description }}
          </p>
        </div>
      </div>
    </template>

    <template
      v-if="service"
      #body
    >
      <div class="flex flex-col gap-7 sm:gap-8">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-8">
          <div class="flex flex-col gap-5">
            <p class="text-sm leading-relaxed text-toned">
              {{ service.about }}
            </p>

            <div class="mt-auto flex items-center gap-2.5 font-mono text-[11px] text-dimmed">
              <span
                class="size-1.5 rounded-full"
                :class="statusReady ? 'bg-primary' : 'bg-primary/50 animate-pulse'"
              />
              {{ statusReady ? t('home.features.modal.ready') : t('home.features.modal.drawing') }}
            </div>
          </div>

          <div class="min-w-0">
            <ServiceArchitecture
              :service-id="service.id"
              :labels="service.nodes"
              :play-key="playKey"
            />
          </div>
        </div>

        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-dimmed">
            {{ t('home.features.modal.highlights') }}
          </p>
          <ul class="mt-3.5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="(item, index) in service.highlights"
              :key="item"
              class="flex items-start gap-2.5 text-sm text-toned"
              :style="{ animationDelay: `${0.15 + index * 0.08}s` }"
            >
              <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--ui-primary)]" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template
      v-if="service"
      #footer
    >
      <div class="flex w-full flex-wrap items-center justify-end gap-3">
        <UButton
          :label="t('home.features.modal.close')"
          color="neutral"
          variant="ghost"
          @click="close"
        />
        <UButton
          :label="t('home.features.modal.cta')"
          color="primary"
          :to="localePath('contato')"
          @click="close"
        />
      </div>
    </template>
  </UModal>
</template>
