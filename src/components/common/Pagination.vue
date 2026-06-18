<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <!-- 첫 페이지 -->
    <button
      :disabled="page === 0"
      @click="emit('change', 0)"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-5 text-grey-7 transition hover:bg-grey-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      aria-label="첫 페이지"
    >
      <ChevronsLeft class="h-4 w-4" />
    </button>

    <!-- 이전 블록 -->
    <button
      :disabled="!hasPrevBlock"
      @click="emit('change', blockStart - 1)"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-5 text-grey-7 transition hover:bg-grey-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      aria-label="이전 페이지 묶음"
    >
      <ChevronLeft class="h-4 w-4" />
    </button>

    <!-- 현재 블록의 페이지 번호 (10개 단위) -->
    <button
      v-for="p in pages"
      :key="p"
      @click="emit('change', p - 1)"
      :class="[
        'flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-caption1 font-medium transition cursor-pointer',
        page === p - 1
          ? 'bg-primary border-primary text-white'
          : 'border-grey-5 text-grey-8 hover:bg-grey-3'
      ]"
    >
      {{ p }}
    </button>

    <!-- 다음 블록 -->
    <button
      :disabled="!hasNextBlock"
      @click="emit('change', blockStart + blockSize)"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-5 text-grey-7 transition hover:bg-grey-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      aria-label="다음 페이지 묶음"
    >
      <ChevronRight class="h-4 w-4" />
    </button>

    <!-- 마지막 페이지 -->
    <button
      :disabled="page === totalPages - 1"
      @click="emit('change', totalPages - 1)"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-grey-5 text-grey-7 transition hover:bg-grey-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      aria-label="마지막 페이지"
    >
      <ChevronsRight class="h-4 w-4" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps<{
  /** 0-based 현재 페이지 */
  page: number
  totalPages: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

// 10개 단위 묶음으로 페이지 번호를 보여준다 (1~10, 11~20 …)
const blockSize = 10

// 현재 묶음의 시작 페이지 (0-based 인덱스)
const blockStart = computed(() => Math.floor(props.page / blockSize) * blockSize)

// 현재 묶음에 표시할 1-based 페이지 번호 목록
const pages = computed(() => {
  const end = Math.min(blockStart.value + blockSize, props.totalPages)
  const result: number[] = []
  for (let i = blockStart.value; i < end; i++) result.push(i + 1)
  return result
})

const hasPrevBlock = computed(() => blockStart.value > 0)
const hasNextBlock = computed(() => blockStart.value + blockSize < props.totalPages)
</script>
