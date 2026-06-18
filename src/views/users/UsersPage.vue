<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { Users } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import FilterChips from '@/components/common/FilterChips.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usersApi } from '@/api/users.api'
import type { UserJob, UserPage } from '@/types/user'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const page = ref<UserPage | null>(null)

const keyword = ref((route.query.keyword as string) || '')
const jobFilter = ref<UserJob | ''>((route.query.job as UserJob) || '')
const statusFilter = ref<'active' | 'deleted' | ''>((route.query.status as 'active' | 'deleted') || '')
const currentPage = ref(Number(route.query.page) || 0)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const columns = [
  { key: 'email', label: '이메일', align: 'left' as const },
  { key: 'nickname', label: '닉네임', align: 'center' as const },
  { key: 'job', label: '직무', align: 'center' as const },
  { key: 'age', label: '나이', align: 'center' as const },
  { key: 'experience', label: '연차', align: 'center' as const },
  { key: 'createdAt', label: '가입일', align: 'center' as const },
  { key: 'lastLoginAt', label: '마지막 로그인', align: 'center' as const },
  { key: 'onboardingCompleted', label: '온보딩', align: 'center' as const },
  { key: 'deleted', label: '상태', align: 'center' as const },
]

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
    toast.error(getErrorMessage(error, '유저 목록을 불러오지 못했습니다.'))
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

const onKeywordInput = (value: string) => {
  keyword.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 0
    syncQuery()
    fetchUsers()
  }, 300)
}

const onJobChange = (value: UserJob | '') => {
  jobFilter.value = value
  onFilterChange()
}

const onStatusChange = (value: 'active' | 'deleted' | '') => {
  statusFilter.value = value
  onFilterChange()
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

onMounted(fetchUsers)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="유저 관리" :subtitle="page ? `총 ${page.totalElements}명` : undefined" />

      <!-- 검색 + 필터 (모바일: 한 줄씩, sm 이상: 한 행) -->
      <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div class="w-full sm:min-w-[220px] sm:flex-1">
          <SearchInput
            :model-value="keyword"
            placeholder="이메일 또는 닉네임 검색"
            @update:model-value="onKeywordInput"
          />
        </div>
        <FilterChips :model-value="jobFilter" :options="jobOptions" @update:model-value="onJobChange" />
        <FilterChips :model-value="statusFilter" :options="statusOptions" @update:model-value="onStatusChange" />
      </div>

      <DataTable
        :columns="columns"
        :rows="page?.content ?? []"
        row-key="id"
        min-width="min-w-[900px]"
        clickable
        :loading="isLoading"
        empty-message="유저가 없습니다."
        :empty-icon="Users"
        @row-click="(row) => router.push(`/users/${row.id}`)"
      >
        <template #cell-email="{ row }">
          <span class="block max-w-[180px] truncate">{{ row.email || '-' }}</span>
        </template>
        <template #cell-nickname="{ row }">
          <span class="text-grey-9">{{ row.nickname || '-' }}</span>
        </template>
        <template #cell-job="{ row }">
          <span class="text-grey-9">{{ jobLabel(row.job) }}</span>
        </template>
        <template #cell-age="{ row }">
          <span class="whitespace-nowrap text-caption1 text-grey-7">{{ ageLabel(row.age) }}</span>
        </template>
        <template #cell-experience="{ row }">
          <span class="whitespace-nowrap text-caption1 text-grey-7">{{ expLabel(row.experience) }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap text-caption1 text-grey-7">{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #cell-lastLoginAt="{ row }">
          <span class="whitespace-nowrap text-caption1 text-grey-7">{{ formatDate(row.lastLoginAt) }}</span>
        </template>
        <template #cell-onboardingCompleted="{ row }">
          <Badge :tone="row.onboardingCompleted ? 'green' : 'grey'">
            {{ row.onboardingCompleted ? '완료' : '미완료' }}
          </Badge>
        </template>
        <template #cell-deleted="{ row }">
          <Badge :tone="row.deleted ? 'red' : 'green'">{{ row.deleted ? '탈퇴' : '활성' }}</Badge>
        </template>
      </DataTable>

      <Pagination
        v-if="page"
        :page="currentPage"
        :total-pages="page.totalPages"
        @change="goToPage"
      />
    </div>
  </DashboardLayout>
</template>
