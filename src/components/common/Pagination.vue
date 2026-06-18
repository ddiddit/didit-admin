<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <!-- 이전 -->
    <button
      :disabled="page === 0"
      @click="emit('change', page - 1)"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-5 text-grey-7 transition hover:bg-grey-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      aria-label="이전 페이지"
    >
      <ChevronLeft class="h-4 w-4" />
    </button>

    <!-- 페이지 번호 -->
    <template v-for="(item, idx) in items" :key="idx">
      <span v-if="item === '...'" class="px-1.5 text-caption1 text-grey-6 select-none">…</span>
      <button
        v-else
        @click="emit('change', item - 1)"
        :class="[
          'flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-caption1 font-medium transition cursor-pointer',
          page === item - 1
            ? 'bg-primary border-primary text-white'
            : 'border-grey-5 text-grey-8 hover:bg-grey-3'
        ]"
      >
        {{ item }}
      </button>
    </template>

    <!-- 다음 -->
    <button
      :disabled="page >= totalPages - 1"
      @click="emit('change', page + 1)"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-5 text-grey-7 transition hover:bg-grey-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      aria-label="다음 페이지"
    >
      <ChevronRight class="h-4 w-4" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  /** 0-based 현재 페이지 */
  page: number
  totalPages: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

// 1-based 페이지 번호 목록 (양끝/현재 주변만 노출, 나머지는 '...')
const items = computed<(number | '...')[]>(() => {
  const total = props.totalPages
  const current = props.page + 1
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) result.push('...')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < total - 1) result.push('...')
  result.push(total)
  return result
})
</script>
