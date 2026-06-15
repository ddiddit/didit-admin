<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="flex items-center justify-center gap-2 transition-colors duration-150 rounded-xl cursor-pointer"
    :class="[sizeClasses, variantClasses]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'chip' | 'ghost' | 'danger'
  size?: 'lg' | 'md' | 'sm'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'lg',
  type: 'button',
  disabled: false,
  loading: false,
  active: false,
})

const sizeClasses = computed(() => {
  if (props.size === 'lg') return 'w-full h-14 px-4 text-body2 font-semibold'
  if (props.size === 'md') return 'w-full h-[50px] px-4 text-body3 font-semibold'
  return 'px-4 h-8 text-label1 font-medium'
})

const variantClasses = computed(() => {
  if (props.disabled || props.loading) {
    return 'bg-grey-5 text-grey-7 cursor-not-allowed'
  }
  if (props.variant === 'primary') {
    return 'bg-primary text-white hover:bg-green-hover active:bg-green-active'
  }
  if (props.variant === 'secondary') {
    return props.active
      ? 'bg-green-light border border-primary text-grey-13 font-semibold'
      : 'bg-grey-4 text-grey-13 border border-transparent hover:bg-grey-5'
  }
  if (props.variant === 'chip') {
    return props.active
      ? 'bg-green-light border border-primary text-grey-13 font-semibold'
      : 'bg-white text-grey-13 border border-grey-5 hover:border-primary/50'
  }
  if (props.variant === 'ghost') {
    return 'bg-transparent text-primary hover:opacity-80'
  }
  if (props.variant === 'danger') {
    return 'bg-danger text-white hover:bg-danger-50'
  }
  return ''
})
</script>
