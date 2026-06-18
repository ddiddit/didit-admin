<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 class="text-heading2 font-semibold text-grey-13">{{ title }}</h2>
      <p v-if="subtitle" class="mt-0.5 text-label1 text-grey-7">{{ subtitle }}</p>
    </div>
    <!-- 우측 액션 영역 (버튼 등) -->
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
