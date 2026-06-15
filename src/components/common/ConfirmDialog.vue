<script setup lang="ts">
import { X } from 'lucide-vue-next'
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

<template>
  <Teleport to="body">
    <BaseSpinner :show="isLoading ?? false" />
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" @click.self="emit('close')">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow-card">

        <!-- 헤더 -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-grey-5">
          <h3 class="text-body3 font-semibold text-grey-13">{{ title }}</h3>
          <button @click="emit('close')" class="text-grey-6 hover:text-grey-9 cursor-pointer transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 바디 -->
        <div class="px-6 py-5">
          <p class="text-label1 text-grey-8 whitespace-pre-line">{{ description }}</p>

          <div class="flex gap-2 mt-5">
            <button
              @click="emit('close')"
              :disabled="isLoading"
              class="flex-1 rounded-xl border border-grey-5 py-2.5 text-label1 font-medium text-grey-7 hover:bg-grey-3 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              @click="emit('confirm')"
              :disabled="isLoading"
              :class="[
                'flex-1 rounded-xl py-2.5 text-label1 font-semibold text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                isDanger ? 'bg-danger hover:bg-danger-50' : 'bg-primary hover:bg-green-hover'
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
