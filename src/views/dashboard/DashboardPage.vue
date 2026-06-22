<script setup lang="ts">
import { ref, onMounted, computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Users, FileText, MessageSquare, TrendingUp, Activity, BookOpen, Type, Mic, ArrowUpFromLine, ArrowDownToLine, Sigma, Gauge } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Card from '@/components/common/Card.vue'
import Badge from '@/components/common/Badge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { dashboardApi } from '@/api/dashboard.api'
import type { DashboardStats, DailyRetroCount } from '@/types/dashboard'
import { formatDate, formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()
const stats = ref<DashboardStats | null>(null)
const isLoading = ref(false)

interface Metric {
  label: string
  value: number | undefined
  icon: Component
  iconClass: string
  highlight?: boolean
}

const metrics = computed<Metric[]>(() => [
  { label: '총 가입자', value: stats.value?.totalUsers, icon: Users, iconClass: 'text-grey-6' },
  { label: '오늘 신규', value: stats.value?.newUsersToday, icon: TrendingUp, iconClass: 'text-primary' },
  { label: 'DAU', value: stats.value?.dau, icon: Activity, iconClass: 'text-info' },
  { label: '총 회고', value: stats.value?.totalRetrospects, icon: FileText, iconClass: 'text-grey-6' },
  { label: '오늘 회고', value: stats.value?.todayRetrospects, icon: BookOpen, iconClass: 'text-primary' },
  { label: '미답변 문의', value: stats.value?.unansweredInquiries, icon: MessageSquare, iconClass: 'text-danger', highlight: true },
])

// AI 사용 현황 지표 (답변 유형·토큰 사용량)
const usageMetrics = computed<Metric[]>(() => {
  const inTok = stats.value?.totalInputTokens
  const outTok = stats.value?.totalOutputTokens
  const totalTok = inTok != null && outTok != null ? inTok + outTok : undefined
  const retros = stats.value?.totalRetrospects
  // 1회고당 평균 토큰(입력+출력) — 비용 감각용 요약 지표
  const avgPerRetro = totalTok != null && retros ? Math.round(totalTok / retros) : undefined
  return [
    { label: '텍스트 답변', value: stats.value?.textAnswerCount, icon: Type, iconClass: 'text-grey-6' },
    { label: '음성 답변', value: stats.value?.voiceAnswerCount, icon: Mic, iconClass: 'text-primary' },
    { label: '입력 토큰', value: inTok, icon: ArrowUpFromLine, iconClass: 'text-info' },
    { label: '출력 토큰', value: outTok, icon: ArrowDownToLine, iconClass: 'text-info' },
    { label: '총 토큰', value: totalTok, icon: Sigma, iconClass: 'text-grey-6' },
    { label: '1회고당 평균 토큰', value: avgPerRetro, icon: Gauge, iconClass: 'text-primary' },
  ]
})

const inquiryTypeLabel = (type: string) => {
  const map: Record<string, string> = { USAGE: '이용 문의', BUG: '버그 신고', IMPROVEMENT: '개선 제안', ETC: '기타' }
  return map[type] ?? type
}

const jobLabel = (job: string | null) => {
  const map: Record<string, string> = { DEVELOPER: '개발', PLANNER: '기획', DESIGNER: '디자인' }
  return job ? (map[job] ?? job) : '-'
}

const fetchStats = async () => {
  isLoading.value = true
  try {
    const res = await dashboardApi.getStats()
    stats.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '대시보드 데이터를 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

// 주간 추이 차트 계산
const chartMax = computed(() => Math.max(...(stats.value?.weeklyRetroTrend ?? []).map(d => d.count), 1))

const chartDays = computed<DailyRetroCount[]>(() => {
  const today = new Date()
  const days: DailyRetroCount[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const found = stats.value?.weeklyRetroTrend.find(t => t.date === dateStr)
    days.push({ date: dateStr, count: found?.count ?? 0 })
  }
  return days
})

const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// SVG 라인/영역 차트용 좌표 (x·y 모두 0~100 비율 공간)
interface ChartPoint { x: number; y: number; count: number; label: string }
const chartPoints = computed<ChartPoint[]>(() => {
  const days = chartDays.value
  const max = chartMax.value
  const n = days.length
  return days.map((d, i) => ({
    x: n <= 1 ? 50 : (i / (n - 1)) * 100,
    y: 100 - (d.count / max) * 100,
    count: d.count,
    label: dayLabel(d.date),
  }))
})

const linePoints = computed(() => chartPoints.value.map(p => `${p.x},${p.y}`).join(' '))

const areaPath = computed(() => {
  const pts = chartPoints.value
  if (pts.length === 0) return ''
  let d = `M ${pts[0].x},100`
  pts.forEach(p => { d += ` L ${p.x},${p.y}` })
  d += ` L ${pts[pts.length - 1].x},100 Z`
  return d
})

onMounted(fetchStats)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-6">
      <PageHeader title="대시보드" subtitle="서비스 현황을 한눈에 확인하세요." />

      <!-- 지표 카드 -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card v-for="metric in metrics" :key="metric.label" :padded="false" class="space-y-2 px-4 py-3.5">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">{{ metric.label }}</p>
            <component :is="metric.icon" class="h-3.5 w-3.5" :class="metric.iconClass" />
          </div>
          <p
            class="text-heading2 font-bold"
            :class="metric.highlight && (metric.value ?? 0) > 0 ? 'text-danger' : 'text-grey-13'"
          >
            {{ formatNumber(metric.value) }}
          </p>
        </Card>
      </div>

      <!-- AI 사용 현황 (답변 유형·토큰 사용량) -->
      <div>
        <h3 class="mb-3 text-label1 font-semibold text-grey-13">AI 사용 현황</h3>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card v-for="metric in usageMetrics" :key="metric.label" :padded="false" class="space-y-2 px-4 py-3.5">
            <div class="flex items-center justify-between">
              <p class="text-caption1 text-grey-7">{{ metric.label }}</p>
              <component :is="metric.icon" class="h-3.5 w-3.5" :class="metric.iconClass" />
            </div>
            <p class="text-heading2 font-bold text-grey-13">{{ formatNumber(metric.value) }}</p>
          </Card>
        </div>
      </div>

      <!-- 주간 회고 추이 (꺾은선+영역 차트) -->
      <Card>
        <h3 class="mb-6 text-label1 font-semibold text-grey-13">주간 회고 추이 (최근 7일)</h3>
        <div class="relative w-full" style="height: 200px">
          <!-- 플롯 영역: 값 라벨(위)·날짜 라벨(아래) 공간 확보 -->
          <div class="absolute inset-x-1 bottom-7 top-7">
            <svg class="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path :d="areaPath" class="fill-primary/10" />
              <polyline
                :points="linePoints"
                fill="none"
                class="stroke-primary"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
                vector-effect="non-scaling-stroke"
              />
            </svg>

            <!-- 데이터 점 -->
            <div
              v-for="(p, i) in chartPoints"
              :key="`dot-${i}`"
              class="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-surface"
              :style="{ left: `${p.x}%`, top: `${p.y}%` }"
            />

            <!-- 값 라벨 -->
            <div
              v-for="(p, i) in chartPoints"
              :key="`val-${i}`"
              class="absolute -mt-2.5 -translate-x-1/2 -translate-y-full text-caption2 font-medium text-grey-8"
              :style="{ left: `${p.x}%`, top: `${p.y}%` }"
            >
              {{ p.count }}
            </div>

            <!-- 날짜 라벨 -->
            <div
              v-for="(p, i) in chartPoints"
              :key="`label-${i}`"
              class="absolute top-full mt-2 -translate-x-1/2 whitespace-nowrap text-caption2 text-grey-6"
              :style="{ left: `${p.x}%` }"
            >
              {{ p.label }}
            </div>
          </div>
        </div>
      </Card>

      <!-- 최근 활동 -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- 최근 가입 유저 -->
        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-label1 font-semibold text-grey-13">최근 가입 유저</h3>
            <button @click="router.push('/users')" class="text-caption1 text-primary hover:underline cursor-pointer">
              전체 보기
            </button>
          </div>
          <EmptyState v-if="!stats || stats.recentUsers.length === 0" message="가입한 유저가 없습니다." />
          <ul v-else class="divide-y divide-grey-4">
            <li
              v-for="user in stats.recentUsers"
              :key="user.id"
              class="-mx-2 flex cursor-pointer items-center justify-between rounded-xl px-2 py-3 transition hover:bg-grey-3"
              @click="router.push(`/users/${user.id}`)"
            >
              <div class="min-w-0">
                <p class="truncate text-label1 text-grey-13">{{ user.email || user.nickname || '-' }}</p>
                <p class="text-caption1 text-grey-7">{{ jobLabel(user.job) }}</p>
              </div>
              <p class="shrink-0 text-caption1 text-grey-7">{{ formatDate(user.createdAt) }}</p>
            </li>
          </ul>
        </Card>

        <!-- 최근 문의 -->
        <Card>
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-label1 font-semibold text-grey-13">최근 문의</h3>
            <button @click="router.push('/inquiries')" class="text-caption1 text-primary hover:underline cursor-pointer">
              전체 보기
            </button>
          </div>
          <EmptyState v-if="!stats || stats.recentInquiries.length === 0" message="등록된 문의가 없습니다." />
          <ul v-else class="divide-y divide-grey-4">
            <li
              v-for="inquiry in stats.recentInquiries"
              :key="inquiry.id"
              class="-mx-2 flex cursor-pointer items-center justify-between rounded-xl px-2 py-3 transition hover:bg-grey-3"
              @click="router.push(`/inquiries/${inquiry.id}`)"
            >
              <div class="mr-3 min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <Badge tone="grey">{{ inquiryTypeLabel(inquiry.type) }}</Badge>
                  <Badge :tone="inquiry.status === 'PENDING' ? 'yellow' : 'green'">
                    {{ inquiry.status === 'PENDING' ? '미답변' : '답변 완료' }}
                  </Badge>
                </div>
                <p class="mt-1 truncate text-caption1 text-grey-8">{{ inquiry.content }}</p>
              </div>
              <p class="shrink-0 text-caption1 text-grey-7">{{ formatDate(inquiry.createdAt) }}</p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
