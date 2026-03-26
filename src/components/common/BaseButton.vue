<template>
  <button
      :type="type"
      :disabled="disabled"
      :class="[
            'w-full rounded-xl py-3 text-sm font-semibold transition active:scale-[0.98]',
            disabled
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : [variantClass, 'cursor-pointer'],
        ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
})

const variantClass = computed(() => {
  const map: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    outline: 'border border-primary text-primary',
    ghost: 'text-gray-500',
    danger: 'border border-neutral-200 text-neutral-500 hover:bg-red-50 hover:text-red-500',
  }
  return map[props.variant]
})
</script>