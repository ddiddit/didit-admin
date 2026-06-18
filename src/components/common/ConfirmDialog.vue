<template>
  <BaseSpinner :show="isLoading ?? false" />
  <BaseModal :show="true" :title="title" max-width="max-w-sm" @close="emit('close')">
    <p class="text-label1 text-grey-8 whitespace-pre-line leading-relaxed">{{ description }}</p>

    <template #footer>
      <div class="flex gap-2">
        <BaseButton variant="ghost" block :disabled="isLoading" @click="emit('close')">
          취소
        </BaseButton>
        <BaseButton
          :variant="isDanger ? 'danger' : 'primary'"
          block
          :loading="isLoading"
          @click="emit('confirm')"
        >
          {{ confirmText ?? '확인' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

defineProps<{
  title: string
  description: string
  confirmText?: string
  isDanger?: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>
