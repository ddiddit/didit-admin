<template>
  <div class="relative inline-block">
    <select
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="h-11 appearance-none rounded-xl border border-grey-5 bg-surface pl-3.5 pr-9 text-label1 text-grey-13 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <ChevronDown class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-7" />
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
