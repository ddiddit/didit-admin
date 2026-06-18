<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      @click="emit('update:modelValue', opt.value)"
      :class="[
        'rounded-xl border px-3 py-2 text-label1 font-medium transition cursor-pointer',
        modelValue === opt.value
          ? 'bg-green-light border-primary text-green-dark'
          : 'bg-grey-3 border-grey-5 text-grey-8 hover:border-primary/50'
      ]"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
defineProps<{
  modelValue: T
  options: { value: T; label: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
</script>
