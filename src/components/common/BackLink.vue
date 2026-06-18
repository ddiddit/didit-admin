<template>
  <button
    @click="$emit('click')"
    class="inline-flex items-center gap-1 text-label1 text-grey-7 transition hover:text-grey-9 cursor-pointer"
  >
    <ChevronLeft class="h-4 w-4" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

withDefaults(defineProps<{ label?: string }>(), {
  label: '목록으로',
})

defineEmits<{ click: [] }>()
</script>
