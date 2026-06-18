<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Card from '@/components/common/Card.vue'
import DataTable from '@/components/common/DataTable.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { withdrawalApi } from '@/api/withdrawal.api'
import type { WithdrawalStats } from '@/types/withdrawal'
import { formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const stats = ref<WithdrawalStats | null>(null)
const isLoading = ref(false)

const columns = [
  { key: 'reason', label: '탈퇴 사유', align: 'left' as const },
  { key: 'count', label: '인원', align: 'center' as const },
  { key: 'percentage', label: '비율', align: 'center' as const },
]

const reasonLabel = (reason: string) => {
  const map: Record<string, string> = {
    NO_LONGER_NEEDED: '더 이상 필요 없음',
    MISSING_FEATURES: '원하는 기능 없음',
    SERVICE_ISSUES: '서비스 오류/불편',
    DIFFICULT_TO_USE: '사용이 어려움',
    SWITCHING_SERVICE: '다른 서비스로 이동',
    OTHER: '기타',
  }
  return map[reason] ?? reason
}

// 디자인 토큰 기반 카테고리 색 (style.css의 --color-chart-*)
const barColor = (index: number) => {
  const colors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-6']
  return colors[index] ?? 'bg-chart-6'
}

const fetchStats = async () => {
  isLoading.value = true
  try {
    const res = await withdrawalApi.getStats()
    stats.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '탈퇴 통계를 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchStats)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="탈퇴 사유 통계" subtitle="사용자 탈퇴 사유를 파악하여 서비스 개선에 활용하세요." />

      <template v-if="stats">
        <!-- 요약 카드 -->
        <Card>
          <p class="text-caption1 text-grey-7">총 탈퇴 수</p>
          <p class="mt-1 text-heading1 font-bold text-grey-13">{{ formatNumber(stats.total) }}명</p>
        </Card>

        <!-- 사유별 막대 차트 -->
        <Card class="space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">사유별 분포</h3>
          <EmptyState v-if="stats.breakdown.length === 0" message="탈퇴 기록이 없습니다." />
          <div v-else class="space-y-3">
            <div v-for="(item, index) in stats.breakdown" :key="item.reason" class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-label1 text-grey-13">{{ reasonLabel(item.reason) }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-caption1 text-grey-7">{{ formatNumber(item.count) }}명</span>
                  <span class="w-12 text-right text-label1 font-semibold text-grey-13">{{ item.percentage.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-grey-4">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="barColor(index)"
                  :style="{ width: `${item.percentage}%` }"
                />
              </div>
            </div>
          </div>
        </Card>

        <!-- 상세 테이블 -->
        <DataTable
          :columns="columns"
          :rows="stats.breakdown"
          row-key="reason"
          min-width="min-w-[400px]"
          empty-message="탈퇴 기록이 없습니다."
        >
          <template #cell-reason="{ row }">{{ reasonLabel(row.reason) }}</template>
          <template #cell-count="{ row }">
            <span class="font-semibold">{{ formatNumber(row.count) }}</span>
          </template>
          <template #cell-percentage="{ row }">
            <span class="text-grey-8">{{ row.percentage.toFixed(1) }}%</span>
          </template>
        </DataTable>
      </template>
    </div>
  </DashboardLayout>
</template>
