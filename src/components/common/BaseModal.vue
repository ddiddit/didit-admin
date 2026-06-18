<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="emit('close')"
      >
        <div
          class="modal-panel flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-card"
          :class="maxWidth"
        >
          <!-- 헤더 -->
          <div class="flex items-center justify-between gap-4 px-6 py-5 border-b border-grey-5">
            <div class="min-w-0">
              <h3 class="text-body3 font-semibold text-grey-13">{{ title }}</h3>
              <p v-if="subtitle" class="mt-0.5 text-caption1 text-grey-7 truncate">{{ subtitle }}</p>
            </div>
            <button
              @click="emit('close')"
              class="shrink-0 text-grey-6 hover:text-grey-9 transition cursor-pointer"
              aria-label="닫기"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- 바디 -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <slot />
          </div>

          <!-- 푸터 -->
          <div v-if="$slots.footer" class="border-t border-grey-5 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(defineProps<{
  show: boolean
  title: string
  subtitle?: string
  maxWidth?: string
}>(), {
  maxWidth: 'max-w-md',
})

const emit = defineEmits<{ close: [] }>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel { transition: transform 0.2s ease; }
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel { transform: scale(0.97); }
</style>
