<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Users, FileText, MessageSquare, TrendingUp, Activity, BookOpen } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { dashboardApi } from '@/api/dashboard.api'
import type { DashboardStats, DailyRetroCount } from '@/types/dashboard'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()
const stats = ref<DashboardStats | null>(null)
const isLoading = ref(false)

const inquiryTypeLabel = (type: string) => {
  const map: Record<string, string> = { USAGE: '이용 문의', BUG: '버그 신고', IMPROVEMENT: '개선 제안', ETC: '기타' }
  return map[type] ?? type
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
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
    const problem = (error as { response?: { data?: ProblemDetail } })?.response?.data
    toast.error(problem?.detail || '대시보드 데이터를 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 주간 추이 차트 계산
const chartMax = computed(() => {
  const trend = stats.value?.weeklyRetroTrend ?? []
  return Math.max(...trend.map(d => d.count), 1)
})

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
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">대시보드</h2>
        <p class="mt-0.5 text-label1 text-grey-7">서비스 현황을 한눈에 확인하세요.</p>
      </div>

      <!-- 지표 카드 (2열 → 3열 → 6열) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="rounded-2xl bg-surface border border-grey-5 px-4 py-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">총 가입자</p>
            <Users class="w-3.5 h-3.5 text-grey-6" />
          </div>
          <p class="text-heading2 font-bold text-grey-13">{{ stats?.totalUsers?.toLocaleString() ?? '-' }}</p>
        </div>

        <div class="rounded-2xl bg-surface border border-grey-5 px-4 py-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">오늘 신규</p>
            <TrendingUp class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-heading2 font-bold text-grey-13">{{ stats?.newUsersToday?.toLocaleString() ?? '-' }}</p>
        </div>

        <div class="rounded-2xl bg-surface border border-grey-5 px-4 py-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">DAU</p>
            <Activity class="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p class="text-heading2 font-bold text-grey-13">{{ stats?.dau?.toLocaleString() ?? '-' }}</p>
        </div>

        <div class="rounded-2xl bg-surface border border-grey-5 px-4 py-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">총 회고</p>
            <FileText class="w-3.5 h-3.5 text-grey-6" />
          </div>
          <p class="text-heading2 font-bold text-grey-13">{{ stats?.totalRetrospects?.toLocaleString() ?? '-' }}</p>
        </div>

        <div class="rounded-2xl bg-surface border border-grey-5 px-4 py-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">오늘 회고</p>
            <BookOpen class="w-3.5 h-3.5 text-primary" />
          </div>
          <p class="text-heading2 font-bold text-grey-13">{{ stats?.todayRetrospects?.toLocaleString() ?? '-' }}</p>
        </div>

        <div class="rounded-2xl bg-surface border border-grey-5 px-4 py-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-caption1 text-grey-7">미답변 문의</p>
            <MessageSquare class="w-3.5 h-3.5 text-danger" />
          </div>
          <p class="text-heading2 font-bold" :class="(stats?.unansweredInquiries ?? 0) > 0 ? 'text-danger' : 'text-grey-13'">
            {{ stats?.unansweredInquiries?.toLocaleString() ?? '-' }}
          </p>
        </div>
      </div>

      <!-- 주간 회고 추이 -->
      <div class="rounded-2xl bg-surface border border-grey-5 p-5">
        <h3 class="text-label1 font-semibold text-grey-13 mb-4">주간 회고 추이 (최근 7일)</h3>
        <div class="flex items-end gap-2 h-28">
          <div
            v-for="day in chartDays"
            :key="day.date"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <span class="text-caption2 text-grey-7">{{ day.count }}</span>
            <div class="w-full flex items-end" style="height: 72px;">
              <div
                class="w-full rounded-t-lg bg-primary/70 transition-all duration-500 min-h-[2px]"
                :style="{ height: barHeight(day.count) }"
              />
            </div>
            <span class="text-caption2 text-grey-6">{{ dayLabel(day.date) }}</span>
          </div>
        </div>
      </div>

      <!-- 최근 활동 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- 최근 가입 유저 -->
        <div class="rounded-2xl bg-surface border border-grey-5 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-label1 font-semibold text-grey-13">최근 가입 유저</h3>
            <button @click="router.push('/users')" class="text-caption1 text-primary hover:underline cursor-pointer">
              전체 보기
            </button>
          </div>

          <div v-if="!stats || stats.recentUsers.length === 0" class="py-8 text-center text-caption1 text-grey-7">
            가입한 유저가 없습니다.
          </div>

          <ul v-else class="divide-y divide-grey-4">
            <li
              v-for="user in stats.recentUsers"
              :key="user.id"
              class="flex items-center justify-between py-3 cursor-pointer hover:bg-grey-3 -mx-2 px-2 rounded-xl transition"
              @click="router.push(`/users/${user.id}`)"
            >
              <div>
                <p class="text-label1 text-grey-13">{{ user.email || user.nickname || '-' }}</p>
                <p class="text-caption1 text-grey-7">{{ jobLabel(user.job) }}</p>
              </div>
              <p class="text-caption1 text-grey-7 flex-shrink-0">{{ formatDate(user.createdAt) }}</p>
            </li>
          </ul>
        </div>

        <!-- 최근 문의 -->
        <div class="rounded-2xl bg-surface border border-grey-5 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-label1 font-semibold text-grey-13">최근 문의</h3>
            <button @click="router.push('/inquiries')" class="text-caption1 text-primary hover:underline cursor-pointer">
              전체 보기
            </button>
          </div>

          <div v-if="!stats || stats.recentInquiries.length === 0" class="py-8 text-center text-caption1 text-grey-7">
            등록된 문의가 없습니다.
          </div>

          <ul v-else class="divide-y divide-grey-4">
            <li
              v-for="inquiry in stats.recentInquiries"
              :key="inquiry.id"
              class="flex items-center justify-between py-3 cursor-pointer hover:bg-grey-3 -mx-2 px-2 rounded-xl transition"
              @click="router.push(`/inquiries/${inquiry.id}`)"
            >
              <div class="min-w-0 flex-1 mr-3">
                <div class="flex items-center gap-2">
                  <span class="badge-grey">{{ inquiryTypeLabel(inquiry.type) }}</span>
                  <span v-if="inquiry.status === 'PENDING'" class="badge-yellow">미답변</span>
                  <span v-else class="badge-green">답변 완료</span>
                </div>
                <p class="mt-1 text-caption1 text-grey-8 truncate">{{ inquiry.content }}</p>
              </div>
              <p class="text-caption1 text-grey-7 flex-shrink-0">{{ formatDate(inquiry.createdAt) }}</p>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>
