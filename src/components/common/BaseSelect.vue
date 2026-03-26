<template>
  <select
      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
      v-bind="$attrs"
  >
    <slot />
  </select>
</template>