<template>
  <div class="relative">
    <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-7" />
    <input
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      :placeholder="placeholder"
      class="h-11 w-full rounded-xl border border-grey-5 bg-grey-3 pl-9 pr-4 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
