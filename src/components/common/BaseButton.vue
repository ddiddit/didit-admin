<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-xl transition-colors duration-150 cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
    :class="[sizeClasses, variantClasses, block ? 'w-full' : '']"
    v-bind="$attrs"
  >
    <!-- 로딩 스피너 -->
    <svg v-if="loading" class="animate-spin shrink-0" :class="iconSize" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'chip' | 'ghost' | 'danger'
  size?: 'lg' | 'md' | 'sm'
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  disabled?: boolean
  loading?: boolean
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  block: false,
  disabled: false,
  loading: false,
  active: false,
})

const sizeClasses = computed(() => {
  if (props.size === 'lg') return 'h-14 px-5 text-body2 font-semibold'
  if (props.size === 'md') return 'h-11 px-4 text-label1 font-semibold'
  return 'h-9 px-3.5 text-label1 font-medium'
})

const iconSize = computed(() => (props.size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'))

const variantClasses = computed(() => {
  if (props.disabled || props.loading) {
    return 'bg-grey-5 text-grey-7'
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
    return 'bg-transparent text-grey-8 border border-grey-5 hover:bg-grey-3'
  }
  if (props.variant === 'danger') {
    return 'bg-danger text-white hover:bg-danger-50'
  }
  return ''
})
</script>
