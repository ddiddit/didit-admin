<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { Search } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { usersApi } from '@/api/users.api'
import type { UserJob, UserPage } from '@/types/user'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const page = ref<UserPage | null>(null)

const keyword = ref((route.query.keyword as string) || '')
const jobFilter = ref<UserJob | ''>((route.query.job as UserJob) || '')
const statusFilter = ref<'active' | 'deleted' | ''>((route.query.status as 'active' | 'deleted') || '')
const currentPage = ref(Number(route.query.page) || 0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const jobOptions: { value: UserJob | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'PLANNER', label: '기획' },
  { value: 'DEVELOPER', label: '개발' },
  { value: 'DESIGNER', label: '디자인' },
]

const statusOptions = [
  { value: '' as const, label: '전체' },
  { value: 'active' as const, label: '활성' },
  { value: 'deleted' as const, label: '탈퇴' },
]

const isDeletedParam = computed(() => {
  if (statusFilter.value === 'active') return false
  if (statusFilter.value === 'deleted') return true
  return undefined
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const params: Record<string, unknown> = { page: currentPage.value }
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    if (jobFilter.value) params.job = jobFilter.value
    if (isDeletedParam.value !== undefined) params.isDeleted = isDeletedParam.value

    const response = await usersApi.list(params)
    page.value = response.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '유저 목록을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const syncQuery = () => {
  const q: Record<string, string> = {}
  if (keyword.value) q.keyword = keyword.value
  if (jobFilter.value) q.job = jobFilter.value
  if (statusFilter.value) q.status = statusFilter.value
  if (currentPage.value > 0) q.page = String(currentPage.value)
  router.replace({ query: q })
}

const onKeywordInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 0
    syncQuery()
    fetchUsers()
  }, 300)
}

const onFilterChange = () => {
  currentPage.value = 0
  syncQuery()
  fetchUsers()
}

const goToPage = (p: number) => {
  currentPage.value = p
  syncQuery()
  fetchUsers()
}

const jobLabel = (job: UserJob | null) => {
  const map = { DEVELOPER: '개발', PLANNER: '기획', DESIGNER: '디자인' }
  return job ? map[job] : '-'
}

const ageLabel = (age: string | null) => {
  const map: Record<string, string> = { AGE_20: '20대', AGE_30: '30대', AGE_40_PLUS: '40대+' }
  return age ? map[age] ?? age : '-'
}

const expLabel = (exp: string | null) => {
  const map: Record<string, string> = {
    LESS_THAN_1_YEAR: '1년 미만',
    YEARS_1_TO_2: '1~2년',
    YEARS_3_TO_5: '3~5년',
    YEARS_6_TO_9: '6~9년',
    YEARS_10_PLUS: '10년+',
  }
  return exp ? map[exp] ?? exp : '-'
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

onMounted(fetchUsers)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">

      <!-- 헤더 -->
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">유저 관리</h2>
        <p v-if="page" class="mt-0.5 text-label1 text-grey-7">총 {{ page.totalElements }}명</p>
      </div>

      <!-- 검색 + 필터 -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- 검색 인풋 -->
        <div class="relative flex-1 min-w-[220px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-7" />
          <input
            v-model="keyword"
            @input="onKeywordInput"
            type="text"
            placeholder="이메일 또는 닉네임 검색"
            class="w-full rounded-xl border border-grey-5 bg-grey-3 pl-9 pr-4 py-2.5 text-label1 text-grey-13 placeholder:text-grey-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <!-- 직무 필터 -->
        <div class="flex items-center gap-1">
          <button
            v-for="opt in jobOptions"
            :key="opt.value"
            @click="jobFilter = opt.value; onFilterChange()"
            :class="[
              'rounded-xl px-3 py-2 text-label1 font-medium border transition cursor-pointer',
              jobFilter === opt.value
                ? 'bg-green-light border-primary text-green-dark'
                : 'bg-grey-3 border-grey-5 text-grey-8 hover:border-primary/50'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- 상태 필터 -->
        <div class="flex items-center gap-1">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            @click="statusFilter = opt.value; onFilterChange()"
            :class="[
              'rounded-xl px-3 py-2 text-label1 font-medium border transition cursor-pointer',
              statusFilter === opt.value
                ? 'bg-green-light border-primary text-green-dark'
                : 'bg-grey-3 border-grey-5 text-grey-8 hover:border-primary/50'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 테이블 -->
      <div class="overflow-x-auto rounded-2xl bg-surface border border-grey-5">
        <table class="w-full text-sm min-w-[900px]">
          <thead>
            <tr class="border-b border-grey-5 bg-grey-3">
              <th class="px-4 py-3.5 text-left text-caption1 font-semibold text-grey-7">이메일</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">닉네임</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">직무</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">나이</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">연차</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">가입일</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">마지막 로그인</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">온보딩</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">상태</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-4">
            <tr v-if="!page || page.content.length === 0">
              <td colspan="9" class="py-16 text-center text-label1 text-grey-7">
                {{ isLoading ? '' : '유저가 없습니다.' }}
              </td>
            </tr>
            <tr
              v-for="user in page?.content"
              :key="user.id"
              class="hover:bg-grey-3 transition cursor-pointer"
              @click="router.push(`/users/${user.id}`)"
            >
              <td class="px-4 py-4 text-label1 text-grey-13">
                <span class="block max-w-[180px] truncate">{{ user.email || '-' }}</span>
              </td>
              <td class="px-4 py-4 text-center text-label1 text-grey-9">
                {{ user.nickname || '-' }}
              </td>
              <td class="px-4 py-4 text-center text-label1 text-grey-9">
                {{ jobLabel(user.job) }}
              </td>
              <td class="px-4 py-4 text-center text-caption1 text-grey-7 whitespace-nowrap">
                {{ ageLabel(user.age) }}
              </td>
              <td class="px-4 py-4 text-center text-caption1 text-grey-7 whitespace-nowrap">
                {{ expLabel(user.experience) }}
              </td>
              <td class="px-4 py-4 text-center text-caption1 text-grey-7 whitespace-nowrap">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-4 py-4 text-center text-caption1 text-grey-7 whitespace-nowrap">
                {{ formatDate(user.lastLoginAt) }}
              </td>
              <td class="px-4 py-4 text-center">
                <span :class="user.onboardingCompleted ? 'badge-green' : 'badge-grey'">
                  {{ user.onboardingCompleted ? '완료' : '미완료' }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <span :class="user.deleted ? 'badge-red' : 'badge-green'">
                  {{ user.deleted ? '탈퇴' : '활성' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="page && page.totalPages > 1" class="flex items-center justify-center gap-1">
        <button
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
          class="rounded-xl border border-grey-5 px-3 py-2 text-caption1 font-medium text-grey-7 hover:bg-grey-3 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          이전
        </button>
        <button
          v-for="p in page.totalPages"
          :key="p"
          @click="goToPage(p - 1)"
          :class="[
            'rounded-xl border px-3 py-2 text-caption1 font-medium transition cursor-pointer',
            currentPage === p - 1
              ? 'bg-primary border-primary text-white'
              : 'border-grey-5 text-grey-8 hover:bg-grey-3'
          ]"
        >
          {{ p }}
        </button>
        <button
          :disabled="currentPage >= page.totalPages - 1"
          @click="goToPage(currentPage + 1)"
          class="rounded-xl border border-grey-5 px-3 py-2 text-caption1 font-medium text-grey-7 hover:bg-grey-3 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          다음
        </button>
      </div>

    </div>
  </DashboardLayout>
</template>
