<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { withdrawalApi } from '@/api/withdrawal.api'
import type { WithdrawalStats } from '@/types/withdrawal'
import type { ProblemDetail } from '@/types/api'

const stats = ref<WithdrawalStats | null>(null)
const isLoading = ref(false)

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

const barColor = (index: number) => {
  const colors = [
    'bg-primary',
    'bg-blue-500',
    'bg-yellow-400',
    'bg-orange-400',
    'bg-purple-400',
    'bg-grey-6',
  ]
  return colors[index] ?? 'bg-grey-6'
}

const fetchStats = async () => {
  isLoading.value = true
  try {
    const res = await withdrawalApi.getStats()
    stats.value = res.data.data
  } catch (error: unknown) {
    const problem = (error as { response?: { data?: ProblemDetail } })?.response?.data
    toast.error(problem?.detail || '탈퇴 통계를 불러오지 못했습니다.')
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
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">탈퇴 사유 통계</h2>
        <p class="mt-0.5 text-label1 text-grey-7">사용자 탈퇴 사유를 파악하여 서비스 개선에 활용하세요.</p>
      </div>

      <template v-if="stats">
        <!-- 요약 카드 -->
        <div class="rounded-2xl bg-surface border border-grey-5 px-6 py-5">
          <p class="text-caption1 text-grey-7">총 탈퇴 수</p>
          <p class="mt-1 text-heading1 font-bold text-grey-13">{{ stats.total.toLocaleString() }}명</p>
        </div>

        <!-- 사유별 막대 차트 -->
        <div class="rounded-2xl bg-surface border border-grey-5 p-5 space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">사유별 분포</h3>

          <div v-if="stats.breakdown.length === 0" class="py-10 text-center text-caption1 text-grey-7">
            탈퇴 기록이 없습니다.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in stats.breakdown"
              :key="item.reason"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between">
                <span class="text-label1 text-grey-13">{{ reasonLabel(item.reason) }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-caption1 text-grey-7">{{ item.count.toLocaleString() }}명</span>
                  <span class="text-label1 font-semibold text-grey-13 w-12 text-right">{{ item.percentage.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="h-2.5 w-full rounded-full bg-grey-4 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="barColor(index)"
                  :style="{ width: `${item.percentage}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 상세 테이블 -->
        <div class="overflow-x-auto rounded-2xl bg-surface border border-grey-5">
          <table class="w-full text-sm min-w-[400px]">
            <thead>
              <tr class="border-b border-grey-5 bg-grey-3">
                <th class="px-5 py-3.5 text-left text-caption1 font-semibold text-grey-7">탈퇴 사유</th>
                <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">인원</th>
                <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">비율</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-grey-4">
              <tr v-if="stats.breakdown.length === 0">
                <td colspan="3" class="py-12 text-center text-label1 text-grey-7">탈퇴 기록이 없습니다.</td>
              </tr>
              <tr v-for="item in stats.breakdown" :key="item.reason" class="hover:bg-grey-3 transition">
                <td class="px-5 py-4 text-label1 text-grey-13">{{ reasonLabel(item.reason) }}</td>
                <td class="px-5 py-4 text-center text-label1 font-semibold text-grey-13">{{ item.count.toLocaleString() }}</td>
                <td class="px-5 py-4 text-center text-label1 text-grey-8">{{ item.percentage.toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
