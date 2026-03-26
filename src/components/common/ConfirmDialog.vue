<script setup lang="ts">
import { X } from 'lucide-vue-next'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

defineProps<{
  title: string
  description: string
  confirmText?: string
  confirmClass?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <BaseSpinner :show="isLoading ?? false" />
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" @click.self="emit('close')">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg">

        <!-- 헤더 -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <h3 class="text-base font-semibold text-neutral-900">{{ title }}</h3>
          <button @click="emit('close')" class="text-neutral-400 hover:text-neutral-600 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 바디 -->
        <div class="px-6 py-5">
          <p class="text-sm text-neutral-600">{{ description }}</p>

          <div class="flex gap-2 mt-5">
            <button
                @click="emit('close')"
                :disabled="isLoading"
                class="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
                @click="emit('confirm')"
                :disabled="isLoading"
                :class="[
                                'flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                                confirmClass ?? 'bg-primary hover:bg-primary-dark'
                            ]"
            >
              {{ confirmText ?? '확인' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>