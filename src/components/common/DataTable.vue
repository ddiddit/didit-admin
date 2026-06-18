<template>
  <div class="overflow-x-auto rounded-2xl border border-grey-5 bg-surface">
    <table class="w-full text-sm" :class="minWidth" :style="hasWidths ? 'table-layout: fixed' : ''">
      <colgroup v-if="hasWidths">
        <col v-for="col in columns" :key="col.key" :style="col.width ? `width:${col.width}` : ''" />
      </colgroup>
      <thead>
        <tr class="border-b border-grey-5 bg-grey-3">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-3.5 text-caption1 font-semibold text-grey-7',
              alignClass(col.align),
              hideClass(col.hideBelow),
            ]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-grey-4">
        <!-- 빈 상태 -->
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="p-0">
            <EmptyState v-if="!loading" :message="emptyMessage" :icon="emptyIcon" />
            <div v-else class="py-16" />
          </td>
        </tr>
        <!-- 데이터 행 -->
        <tr
          v-for="(row, idx) in rows"
          :key="rowKeyOf(row, idx)"
          :class="['transition', clickable ? 'cursor-pointer hover:bg-grey-3' : 'hover:bg-grey-3']"
          @click="clickable && emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-4 text-label1 text-grey-13',
              alignClass(col.align),
              hideClass(col.hideBelow),
            ]"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<!-- 범용 테이블: 행 타입이 페이지마다 달라 제네릭 any 제약을 사용한다(컴포넌트 한정). -->
<script setup lang="ts" generic="Row extends Record<string, any>">
import { computed, type Component } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'

interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  hideBelow?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<{
  columns: Column[]
  rows: Row[]
  rowKey?: string | ((row: Row, index: number) => string | number)
  minWidth?: string
  emptyMessage?: string
  emptyIcon?: Component
  clickable?: boolean
  loading?: boolean
}>(), {
  emptyMessage: '데이터가 없습니다.',
  clickable: false,
  loading: false,
})

const emit = defineEmits<{ 'row-click': [row: Row] }>()

const hasWidths = computed(() => props.columns.some(c => c.width))

const rowKeyOf = (row: Row, index: number): string | number => {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  if (typeof props.rowKey === 'string') return row[props.rowKey] ?? index
  return index
}

const alignClass = (align?: string) =>
  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

const hideClass = (hideBelow?: string) =>
  hideBelow === 'sm' ? 'hidden sm:table-cell'
    : hideBelow === 'md' ? 'hidden md:table-cell'
      : hideBelow === 'lg' ? 'hidden lg:table-cell'
        : ''
</script>
