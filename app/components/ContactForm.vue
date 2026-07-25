<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { CONTACT_SUBJECTS } from '#shared/constants/contact'

const subjects = [...CONTACT_SUBJECTS]

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
    errors.push({ name: 'name', message: 'Informe seu nome.' })
  }
  if (!EMAIL_RE.test(data.email)) {
    errors.push({ name: 'email', message: 'Informe um e-mail válido.' })
  }
  if (!data.subject) {
    errors.push({ name: 'subject', message: 'Selecione um assunto.' })
  }
  if (data.message.trim().length < 10) {
    errors.push({ name: 'message', message: 'Conte um pouco mais sobre o desafio (mínimo de 10 caracteres).' })
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
        title: 'Não foi possível enviar',
        description: 'Recarregue a página e tente novamente, ou escreva para priimesec@gmail.com.',
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
      title: 'Mensagem enviada!',
      description: 'Recebemos seu contato e retornamos em até 1 dia útil.',
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
      title: 'Não foi possível enviar',
      description: 'Tente novamente ou escreva direto para priimesec@gmail.com.',
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
        label="Nome"
        name="name"
        required
        size="lg"
      >
        <UInput
          v-model="state.name"
          placeholder="Como podemos te chamar?"
          size="xl"
          class="w-full"
          autocomplete="name"
          maxlength="100"
          :ui="fieldUi"
        />
      </UFormField>

      <UFormField
        label="E-mail"
        name="email"
        required
        size="lg"
      >
        <UInput
          v-model="state.email"
          type="email"
          placeholder="voce@empresa.com"
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
        label="Empresa"
        name="company"
        hint="Opcional"
        size="lg"
      >
        <UInput
          v-model="state.company"
          placeholder="Onde você atua"
          size="xl"
          class="w-full"
          autocomplete="organization"
          maxlength="120"
          :ui="fieldUi"
        />
      </UFormField>

      <UFormField
        label="Assunto"
        name="subject"
        required
        size="lg"
      >
        <USelect
          v-model="state.subject"
          :items="subjects"
          placeholder="Qual frente faz sentido?"
          size="xl"
          class="w-full"
          :ui="fieldUi"
        />
      </UFormField>
    </div>

    <UFormField
      label="Mensagem"
      name="message"
      required
      size="lg"
    >
      <UTextarea
        v-model="state.message"
        :rows="5"
        placeholder="Descreva o contexto, o prazo e o que você precisa resolver."
        size="xl"
        class="w-full"
        maxlength="4000"
        :ui="fieldUi"
      />
    </UFormField>

    <div class="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p class="font-mono text-xs text-dimmed">
        hmac · rate-limited · no spam
      </p>
      <UButton
        type="submit"
        label="Enviar mensagem"
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
