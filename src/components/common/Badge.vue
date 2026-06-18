<template>
  <span :class="`badge-${tone}`">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  tone: 'green' | 'grey' | 'yellow' | 'red' | 'blue'
}>()
</script>
