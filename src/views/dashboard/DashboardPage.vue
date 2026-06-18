<script setup lang="ts">
import { ref, onMounted, computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Users, FileText, MessageSquare, TrendingUp, Activity, BookOpen } from 'lucide-vue-next'
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

const barHeight = (count: number) => `${Math.round((count / chartMax.value) * 100)}%`
const dayLabel = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

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

      <!-- 주간 회고 추이 -->
      <Card>
        <h3 class="mb-4 text-label1 font-semibold text-grey-13">주간 회고 추이 (최근 7일)</h3>
        <div class="flex h-28 items-end gap-2">
          <div v-for="day in chartDays" :key="day.date" class="flex flex-1 flex-col items-center gap-1">
            <span class="text-caption2 text-grey-7">{{ day.count }}</span>
            <div class="flex w-full items-end" style="height: 72px;">
              <div
                class="min-h-[2px] w-full rounded-t-lg bg-primary/70 transition-all duration-500"
                :style="{ height: barHeight(day.count) }"
              />
            </div>
            <span class="text-caption2 text-grey-6">{{ dayLabel(day.date) }}</span>
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
