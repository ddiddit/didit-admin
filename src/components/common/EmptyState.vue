<template>
  <div class="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
    <div v-if="icon" class="flex h-12 w-12 items-center justify-center rounded-2xl bg-grey-3">
      <component :is="icon" class="h-6 w-6 text-grey-6" />
    </div>
    <div class="space-y-1">
      <p class="text-label1 font-medium text-grey-8">{{ message }}</p>
      <p v-if="description" class="text-caption1 text-grey-7">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="mt-1">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  message: string
  description?: string
  icon?: Component
}>()
</script>
