<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { CONTACT_SUBJECTS } from '#shared/constants/contact'

const { t } = useI18n()

const subjects = computed(() =>
  CONTACT_SUBJECTS.map(value => ({
    value,
    label: t(`contact.subjects.${value}`)
  }))
)

const state = reactive({
  name: '',
  email: '',
  company: '',
  subject: undefined as (typeof CONTACT_SUBJECTS)[number] | undefined,
  message: '',
  website: ''
})

const challengeToken = ref('')
const formReadyAt = ref(0)

async function refreshChallenge() {
  try {
    const challenge = await $fetch<{ token: string }>('/api/contact/challenge')
    challengeToken.value = challenge.token
    formReadyAt.value = Date.now()
  } catch {
    challengeToken.value = ''
  }
}

onMounted(() => {
  refreshChallenge()
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(data: typeof state): FormError[] {
  const errors: FormError[] = []
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.push({ name: 'name', message: t('contact.errors.name') })
  }
  if (!EMAIL_RE.test(data.email)) {
    errors.push({ name: 'email', message: t('contact.errors.email') })
  }
  if (!data.subject) {
    errors.push({ name: 'subject', message: t('contact.errors.subject') })
  }
  if (data.message.trim().length < 10) {
    errors.push({ name: 'message', message: t('contact.errors.message') })
  }
  return errors
}

const toast = useToast()
const loading = ref(false)

const fieldUi = { base: 'bg-elevated/40 ring-0 border border-white/10 focus-visible:border-white/20' }

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  // Anti-bot: exige ~2s após o challenge (alinha com verificação no servidor).
  const waitMs = Math.max(0, 2100 - (Date.now() - formReadyAt.value))
  if (waitMs > 0) {
    await new Promise(resolve => setTimeout(resolve, waitMs))
  }

  if (!challengeToken.value) {
    await refreshChallenge()
    if (!challengeToken.value) {
      toast.add({
        title: t('contact.toast.failTitle'),
        description: t('contact.toast.failChallenge'),
        icon: 'i-lucide-alert-triangle',
        color: 'error'
      })
      return
    }
  }

  loading.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: event.data.name,
        email: event.data.email,
        company: event.data.company,
        subject: event.data.subject,
        message: event.data.message,
        website: event.data.website,
        challenge: challengeToken.value
      }
    })

    toast.add({
      title: t('contact.toast.successTitle'),
      description: t('contact.toast.successDescription'),
      icon: 'i-lucide-check-circle-2',
      color: 'success'
    })

    Object.assign(state, {
      name: '',
      email: '',
      company: '',
      subject: undefined,
      message: '',
      website: ''
    })
    await refreshChallenge()
  } catch {
    toast.add({
      title: t('contact.toast.failTitle'),
      description: t('contact.toast.failRetry'),
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    await refreshChallenge()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="relative space-y-6"
    @submit="onSubmit"
  >
    <!-- Honeypot: invisível para humanos, atrativo para bots -->
    <div
      class="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <label for="contact-website">Website</label>
      <input
        id="contact-website"
        v-model="state.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-6">
      <UFormField
        :label="t('contact.fields.name')"
        name="name"
        required
        size="lg"
      >
        <UInput
          v-model="state.name"
          :placeholder="t('contact.fields.namePlaceholder')"
          size="xl"
          class="w-full"
          autocomplete="name"
          maxlength="100"
          :ui="fieldUi"
        />
      </UFormField>

      <UFormField
        :label="t('contact.fields.email')"
        name="email"
        required
        size="lg"
      >
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="t('contact.fields.emailPlaceholder')"
          size="xl"
          class="w-full"
          autocomplete="email"
          maxlength="254"
          :ui="fieldUi"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-6">
      <UFormField
        :label="t('contact.fields.company')"
        name="company"
        :hint="t('contact.fields.companyHint')"
        size="lg"
      >
        <UInput
          v-model="state.company"
          :placeholder="t('contact.fields.companyPlaceholder')"
          size="xl"
          class="w-full"
          autocomplete="organization"
          maxlength="120"
          :ui="fieldUi"
        />
      </UFormField>

      <UFormField
        :label="t('contact.fields.subject')"
        name="subject"
        required
        size="lg"
      >
        <USelect
          v-model="state.subject"
          :items="subjects"
          value-key="value"
          :placeholder="t('contact.fields.subjectPlaceholder')"
          size="xl"
          class="w-full"
          :ui="fieldUi"
        />
      </UFormField>
    </div>

    <UFormField
      :label="t('contact.fields.message')"
      name="message"
      required
      size="lg"
    >
      <UTextarea
        v-model="state.message"
        :rows="5"
        :placeholder="t('contact.fields.messagePlaceholder')"
        size="xl"
        class="w-full"
        maxlength="4000"
        :ui="fieldUi"
      />
    </UFormField>

    <div class="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p class="font-mono text-xs text-dimmed">
        rate-limited · no spam
      </p>
      <UButton
        type="submit"
        :label="t('contact.fields.submit')"
        icon="i-lucide-send"
        size="xl"
        class="w-full shrink-0 sm:w-auto sm:min-w-56"
        :ui="{
          base: 'justify-center',
          leadingIcon: 'size-4'
        }"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
