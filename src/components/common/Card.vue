<template>
  <div
    class="bg-surface border border-grey-5"
    :class="[rounded, padded ? 'px-6 py-5' : '']"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** 내부 패딩(px-6 py-5) 적용 여부. 테이블 래퍼 등에서는 false. */
  padded?: boolean
  rounded?: string
}>(), {
  padded: true,
  rounded: 'rounded-2xl',
})
</script>
