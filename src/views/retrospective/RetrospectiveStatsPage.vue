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
import { dashboardApi } from '@/api/dashboard.api'
import type { RetrospectiveStats, DailyRetroCount } from '@/types/retrospectiveStats'
import type { DashboardStats } from '@/types/dashboard'
import { formatNumber } from '@/utils/format'
import { estimateTokenCost, formatWon } from '@/utils/pricing'
import { getErrorMessage } from '@/utils/error'

const stats = ref<RetrospectiveStats | null>(null)
const dash = ref<DashboardStats | null>(null) // 토큰/비용 출처 (전역 누적)
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
interface AnswerBar { label: string; count: number; percentage: number; icon: Component; dotClass: string; strokeClass: string }
const answerBars = computed<AnswerBar[]>(() => {
  const total = answerTotal.value
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100)
  return [
    { label: '텍스트', count: stats.value?.textAnswerCount ?? 0, percentage: pct(stats.value?.textAnswerCount ?? 0), icon: Type, dotClass: 'bg-chart-1', strokeClass: 'stroke-chart-1' },
    { label: '음성', count: stats.value?.voiceAnswerCount ?? 0, percentage: pct(stats.value?.voiceAnswerCount ?? 0), icon: Mic, dotClass: 'bg-chart-2', strokeClass: 'stroke-chart-2' },
  ]
})

// 도넛 차트 세그먼트 (원둘레 100 기준, 앞 세그먼트 누적만큼 오프셋을 당겨 이어 그린다)
interface DonutSegment { label: string; percentage: number; strokeClass: string; dashoffset: number }
const donutSegments = computed<DonutSegment[]>(() => {
  let cumulative = 0
  return answerBars.value
    .filter(b => b.percentage > 0)
    .map(b => {
      const seg = { label: b.label, percentage: b.percentage, strokeClass: b.strokeClass, dashoffset: -cumulative }
      cumulative += b.percentage
      return seg
    })
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

// 라인+영역 차트용 좌표 (x·y 모두 0~100 비율 공간) — 대시보드 주간 추이와 동일 방식
interface ChartPoint { x: number; y: number }
const trendPoints = computed<ChartPoint[]>(() => {
  const days = trendDays.value
  const max = trendMax.value
  const n = days.length
  return days.map((d, i) => ({
    x: n <= 1 ? 50 : (i / (n - 1)) * 100,
    y: 100 - (d.count / max) * 100,
  }))
})
const trendLine = computed(() => trendPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const trendArea = computed(() => {
  const pts = trendPoints.value
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x},100`
  pts.forEach(p => { d += ` L ${p.x},${p.y}` })
  d += ` L ${pts[pts.length - 1].x},100 Z`
  return d
})

// 토큰/비용은 대시보드 통계(전역 누적)에서 가져온다.
// TODO(백엔드): 회고 통계 응답에 토큰 필드가 추가되면 이 별도 호출을 제거하고 통합.
const tokenRows = computed(() => {
  const inTok = dash.value?.totalInputTokens ?? 0
  const outTok = dash.value?.totalOutputTokens ?? 0
  return [
    { label: '입력', tokens: inTok, cost: estimateTokenCost(inTok, 0) },
    { label: '출력', tokens: outTok, cost: estimateTokenCost(0, outTok) },
    { label: '합계', tokens: inTok + outTok, cost: estimateTokenCost(inTok, outTok), total: true },
  ]
})
// 1회고당 평균 토큰·비용 (전체 회고 수 기준)
const perRetro = computed(() => {
  const total = stats.value?.total ?? 0
  const inTok = dash.value?.totalInputTokens ?? 0
  const outTok = dash.value?.totalOutputTokens ?? 0
  if (!total) return null
  return {
    tokens: Math.round((inTok + outTok) / total),
    cost: estimateTokenCost(inTok, outTok) / total,
  }
})

const fetchStats = async () => {
  isLoading.value = true
  try {
    const [retroRes, dashRes] = await Promise.all([
      retrospectiveStatsApi.getStats(),
      dashboardApi.getStats(),
    ])
    stats.value = retroRes.data.data
    dash.value = dashRes.data.data
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

        <!-- 답변 유형 분포 (도넛 차트) -->
        <Card class="space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">답변 유형 분포</h3>
          <EmptyState v-if="answerTotal === 0" message="답변 기록이 없습니다." />
          <div v-else class="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <div class="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" class="stroke-grey-4" stroke-width="3.5" />
                <circle
                  v-for="seg in donutSegments"
                  :key="seg.label"
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  :class="seg.strokeClass"
                  stroke-width="3.5"
                  :stroke-dasharray="`${seg.percentage} ${100 - seg.percentage}`"
                  :stroke-dashoffset="seg.dashoffset"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-heading2 font-bold text-grey-13">{{ formatNumber(answerTotal) }}</span>
                <span class="text-caption2 text-grey-6">총 답변</span>
              </div>
            </div>
            <ul class="w-full space-y-2.5 sm:flex-1">
              <li v-for="bar in answerBars" :key="bar.label" class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="bar.dotClass" />
                <component :is="bar.icon" class="h-3.5 w-3.5 shrink-0 text-grey-6" />
                <span class="whitespace-nowrap text-label1 text-grey-13">{{ bar.label }}</span>
                <span class="ml-auto whitespace-nowrap text-caption1 text-grey-7">{{ formatNumber(bar.count) }}건</span>
                <span class="w-12 shrink-0 text-right text-label1 font-semibold text-grey-13">{{ bar.percentage.toFixed(1) }}%</span>
              </li>
            </ul>
          </div>
        </Card>

        <!-- AI 토큰 · 비용 -->
        <Card class="space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">AI 토큰 · 비용</h3>
          <div class="overflow-x-auto rounded-xl border border-grey-4">
            <table class="w-full text-center">
              <thead class="bg-grey-3 text-caption1 text-grey-7">
                <tr>
                  <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">구분</th>
                  <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">토큰</th>
                  <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">예상 비용</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-grey-4">
                <tr v-for="row in tokenRows" :key="row.label" :class="row.total ? 'bg-grey-2 font-semibold' : ''">
                  <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13">{{ row.label }}</td>
                  <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13 tabular-nums">{{ formatNumber(row.tokens) }}</td>
                  <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13 tabular-nums">{{ formatWon(row.cost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="perRetro" class="flex flex-wrap gap-x-8 gap-y-1 text-caption1 text-grey-7">
            <span>1회고당 평균 토큰 <b class="text-grey-13">{{ formatNumber(perRetro.tokens) }}</b></span>
            <span>1회고당 평균 비용 <b class="text-grey-13">{{ formatWon(perRetro.cost) }}</b></span>
          </div>
          <p class="text-caption2 text-grey-6">* 단가: HCX-005 입력 1.25원 / 출력 5원 (1,000토큰 기준)</p>
        </Card>

        <!-- 최근 30일 완료 추이 (라인+영역 차트) -->
        <Card>
          <h3 class="mb-6 text-label1 font-semibold text-grey-13">최근 30일 회고 완료 추이</h3>
          <div class="relative w-full" style="height: 176px">
            <!-- 플롯 영역: 날짜 라벨(아래) 공간 확보 -->
            <div class="absolute inset-x-1 bottom-6 top-2">
              <svg class="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path :d="trendArea" class="fill-primary/10" />
                <polyline
                  :points="trendLine"
                  fill="none"
                  class="stroke-primary"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>

              <!-- 일자별 hover 영역 + 툴팁 -->
              <div class="absolute inset-0 flex">
                <div v-for="d in trendDays" :key="`hover-${d.date}`" class="group relative flex-1">
                  <div class="pointer-events-none absolute -top-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-grey-13 px-2 py-1 text-caption2 text-surface opacity-0 transition group-hover:opacity-100">
                    {{ dayTick(d.date) }} · {{ d.count }}
                  </div>
                </div>
              </div>

              <!-- 5일 간격 날짜 라벨 -->
              <div class="absolute inset-x-0 top-full mt-1.5 flex">
                <div v-for="(d, i) in trendDays" :key="`label-${d.date}`" class="flex-1 text-center">
                  <span v-if="i % 5 === 0" class="text-caption2 text-grey-6">{{ dayTick(d.date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </DashboardLayout>
</template>
