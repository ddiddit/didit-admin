<template>
  <div ref="root" class="relative inline-block">
    <!-- 트리거 -->
    <button
      type="button"
      @click="open = !open"
      :class="[
        'flex h-11 items-center justify-between gap-2 rounded-xl border bg-surface pl-3.5 pr-3 text-label1 text-grey-13 outline-none transition cursor-pointer',
        open ? 'border-primary ring-2 ring-primary/20' : 'border-grey-5 hover:border-grey-6'
      ]"
      :style="minWidth ? `min-width:${minWidth}` : ''"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <ChevronDown class="h-4 w-4 shrink-0 text-grey-7 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <!-- 옵션 패널 -->
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute left-0 top-full z-30 mt-1.5 max-h-72 min-w-full overflow-y-auto rounded-xl border border-grey-5 bg-surface py-1 shadow-card"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          @click="select(opt.value)"
          :class="[
            'flex w-full items-center justify-between gap-3 whitespace-nowrap px-3.5 py-2.5 text-left text-label1 transition hover:bg-grey-3',
            opt.value === modelValue ? 'font-semibold text-primary' : 'text-grey-9'
          ]"
        >
          {{ opt.label }}
          <Check v-if="opt.value === modelValue" class="h-4 w-4 shrink-0" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  minWidth?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)

const selectedLabel = computed(
  () => props.options.find(o => o.value === props.modelValue)?.label ?? props.options[0]?.label ?? '',
)

const select = (value: string) => {
  emit('update:modelValue', value)
  open.value = false
}

// 바깥 클릭 시 닫기
const onClickOutside = (e: MouseEvent) => {
  if (open.value && root.value && !root.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
