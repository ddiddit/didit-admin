<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { toast } from 'vue-sonner'
import { FileText, CheckCircle2, Loader, Percent, UserRound, Type, Mic } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Card from '@/components/common/Card.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { retrospectiveStatsApi } from '@/api/retrospectiveStats.api'
import type { RetrospectiveStats, DailyRetroCount } from '@/types/retrospectiveStats'
import { formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const stats = ref<RetrospectiveStats | null>(null)
const isLoading = ref(false)

interface Metric {
  label: string
  value: string
  icon: Component
  iconClass: string
}

const metrics = computed<Metric[]>(() => [
  { label: '전체 회고', value: formatNumber(stats.value?.total), icon: FileText, iconClass: 'text-grey-6' },
  { label: '완료', value: formatNumber(stats.value?.completed), icon: CheckCircle2, iconClass: 'text-primary' },
  { label: '진행 중', value: formatNumber(stats.value?.inProgress), icon: Loader, iconClass: 'text-info' },
  { label: '완료율', value: `${(stats.value?.completionRate ?? 0).toFixed(1)}%`, icon: Percent, iconClass: 'text-primary' },
  { label: '유저당 평균', value: `${(stats.value?.avgPerUser ?? 0).toFixed(1)}개`, icon: UserRound, iconClass: 'text-grey-6' },
])

// 답변 유형 분포 (텍스트 vs 음성)
const answerTotal = computed(() => (stats.value?.textAnswerCount ?? 0) + (stats.value?.voiceAnswerCount ?? 0))
interface AnswerBar { label: string; count: number; percentage: number; icon: Component; barClass: string }
const answerBars = computed<AnswerBar[]>(() => {
  const total = answerTotal.value
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100)
  return [
    { label: '텍스트', count: stats.value?.textAnswerCount ?? 0, percentage: pct(stats.value?.textAnswerCount ?? 0), icon: Type, barClass: 'bg-chart-1' },
    { label: '음성', count: stats.value?.voiceAnswerCount ?? 0, percentage: pct(stats.value?.voiceAnswerCount ?? 0), icon: Mic, barClass: 'bg-chart-2' },
  ]
})

// 최근 30일 추이 — 빈 날짜는 0으로 채워 항상 30개 막대를 그린다.
const trendDays = computed<DailyRetroCount[]>(() => {
  const map = new Map((stats.value?.dailyTrend ?? []).map(d => [d.date, d.count]))
  const today = new Date()
  const days: DailyRetroCount[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({ date: dateStr, count: map.get(dateStr) ?? 0 })
  }
  return days
})
const trendMax = computed(() => Math.max(...trendDays.value.map(d => d.count), 1))
const dayTick = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const fetchStats = async () => {
  isLoading.value = true
  try {
    const res = await retrospectiveStatsApi.getStats()
    stats.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '회고 통계를 불러오지 못했습니다.'))
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
      <PageHeader title="회고 통계" subtitle="회고 작성 현황과 완료율을 확인하세요." />

      <template v-if="stats">
        <!-- 요약 지표 -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Card v-for="metric in metrics" :key="metric.label" :padded="false" class="space-y-2 px-4 py-3.5">
            <div class="flex items-center justify-between">
              <p class="text-caption1 text-grey-7">{{ metric.label }}</p>
              <component :is="metric.icon" class="h-3.5 w-3.5" :class="metric.iconClass" />
            </div>
            <p class="text-heading2 font-bold text-grey-13">{{ metric.value }}</p>
          </Card>
        </div>

        <!-- 답변 유형 분포 -->
        <Card class="space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">답변 유형 분포</h3>
          <EmptyState v-if="answerTotal === 0" message="답변 기록이 없습니다." />
          <div v-else class="space-y-3">
            <div v-for="bar in answerBars" :key="bar.label" class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-1.5 text-label1 text-grey-13">
                  <component :is="bar.icon" class="h-3.5 w-3.5 text-grey-6" />{{ bar.label }}
                </span>
                <div class="flex items-center gap-3">
                  <span class="text-caption1 text-grey-7">{{ formatNumber(bar.count) }}건</span>
                  <span class="w-12 text-right text-label1 font-semibold text-grey-13">{{ bar.percentage.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-grey-4">
                <div class="h-full rounded-full transition-all duration-700" :class="bar.barClass" :style="{ width: `${bar.percentage}%` }" />
              </div>
            </div>
          </div>
        </Card>

        <!-- 최근 30일 완료 추이 (막대 차트) -->
        <Card>
          <h3 class="mb-6 text-label1 font-semibold text-grey-13">최근 30일 회고 완료 추이</h3>
          <div class="flex h-44 items-end gap-[3px]">
            <div
              v-for="(d, i) in trendDays"
              :key="d.date"
              class="group relative flex-1"
              :style="{ height: '100%' }"
            >
              <div class="flex h-full items-end">
                <div
                  class="w-full rounded-t bg-primary/80 transition-all duration-500 hover:bg-primary"
                  :style="{ height: `${(d.count / trendMax) * 100}%` }"
                />
              </div>
              <!-- 툴팁 -->
              <div class="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-grey-13 px-2 py-1 text-caption2 text-surface opacity-0 transition group-hover:opacity-100">
                {{ dayTick(d.date) }} · {{ d.count }}
              </div>
              <!-- 5일 간격 날짜 라벨 -->
              <p v-if="i % 5 === 0" class="mt-1.5 text-center text-caption2 text-grey-6">{{ dayTick(d.date) }}</p>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </DashboardLayout>
</template>
