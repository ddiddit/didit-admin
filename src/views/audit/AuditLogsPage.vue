<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { auditLogApi } from '@/api/auditLog.api'
import type { AuditLogsPage } from '@/types/auditLog'
import type { ProblemDetail } from '@/types/api'

const data = ref<AuditLogsPage | null>(null)
const isLoading = ref(false)
const filterAction = ref('')
const filterActorType = ref('')
const currentPage = ref(0)

const ACTION_OPTIONS = [
  { value: '', label: '전체 액션' },
  { value: 'USER_LOGGED_IN', label: '로그인' },
  { value: 'USER_SIGNED_UP', label: '회원가입' },
  { value: 'USER_WITHDREW', label: '탈퇴' },
  { value: 'USER_FORCE_WITHDREW', label: '강제 탈퇴' },
  { value: 'RETROSPECTIVE_STARTED', label: '회고 시작' },
  { value: 'RETROSPECTIVE_SAVED', label: '회고 저장' },
  { value: 'BADGE_ACQUIRED', label: '배지 획득' },
  { value: 'ADMIN_LOGGED_IN', label: '어드민 로그인' },
  { value: 'INQUIRY_ANSWERED', label: '문의 답변' },
  { value: 'NOTICE_REGISTERED', label: '공지 등록' },
  { value: 'APP_CONFIG_UPDATED', label: '앱 설정 변경' },
]

const ACTOR_OPTIONS = [
  { value: '', label: '전체 유형' },
  { value: 'USER', label: '사용자' },
  { value: 'ADMIN', label: '어드민' },
  { value: 'SYSTEM', label: '시스템' },
]

const actionLabel = (action: string) => {
  const found = ACTION_OPTIONS.find(o => o.value === action)
  return found?.label ?? action
}

const actorTypeLabel = (type: string | null) => {
  if (!type) return '-'
  const found = ACTOR_OPTIONS.find(o => o.value === type)
  return found?.label ?? type
}

const actorTypeBadge = (type: string | null) => {
  if (type === 'USER') return 'badge-green'
  if (type === 'ADMIN') return 'badge-yellow'
  return 'badge-grey'
}

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const fetchLogs = async (page = 0) => {
  isLoading.value = true
  try {
    const res = await auditLogApi.list({
      action: filterAction.value || undefined,
      actorType: filterActorType.value || undefined,
      page,
    })
    data.value = res.data.data
    currentPage.value = page
  } catch (error: unknown) {
    const problem = (error as { response?: { data?: ProblemDetail } })?.response?.data
    toast.error(problem?.detail || '감사 로그를 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const onSearch = () => fetchLogs(0)

onMounted(() => fetchLogs(0))
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">감사 로그</h2>
        <p class="mt-0.5 text-label1 text-grey-7">사용자 및 어드민의 주요 행동 기록을 조회합니다.</p>
      </div>

      <!-- 필터 -->
      <div class="flex flex-wrap gap-3">
        <select
          v-model="filterAction"
          class="rounded-xl border border-grey-5 bg-surface px-3 py-2 text-label1 text-grey-13 outline-none focus:border-primary cursor-pointer"
        >
          <option v-for="opt in ACTION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select
          v-model="filterActorType"
          class="rounded-xl border border-grey-5 bg-surface px-3 py-2 text-label1 text-grey-13 outline-none focus:border-primary cursor-pointer"
        >
          <option v-for="opt in ACTOR_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <button
          @click="onSearch"
          class="rounded-xl bg-primary px-4 py-2 text-label1 font-semibold text-white hover:bg-green-hover transition cursor-pointer"
        >
          조회
        </button>
      </div>

      <!-- 로그 테이블 -->
      <div class="overflow-x-auto rounded-2xl bg-surface border border-grey-5">
        <table class="w-full text-sm min-w-[700px]">
          <thead>
            <tr class="border-b border-grey-5 bg-grey-3">
              <th class="px-4 py-3.5 text-left text-caption1 font-semibold text-grey-7">액션</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">유형</th>
              <th class="px-4 py-3.5 text-left text-caption1 font-semibold text-grey-7 hidden md:table-cell">Actor ID</th>
              <th class="px-4 py-3.5 text-left text-caption1 font-semibold text-grey-7 hidden lg:table-cell">Target</th>
              <th class="px-4 py-3.5 text-right text-caption1 font-semibold text-grey-7">발생 시각</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-4">
            <tr v-if="!data || data.content.length === 0">
              <td colspan="5" class="py-16 text-center text-label1 text-grey-7">
                {{ isLoading ? '' : '로그가 없습니다.' }}
              </td>
            </tr>
            <tr
              v-for="(log, idx) in data?.content"
              :key="idx"
              class="hover:bg-grey-3 transition"
            >
              <td class="px-4 py-3.5">
                <span class="text-label1 font-medium text-grey-13">{{ actionLabel(log.action) }}</span>
                <span class="ml-1.5 text-caption2 text-grey-6 hidden sm:inline">{{ log.action }}</span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span :class="actorTypeBadge(log.actorType)">{{ actorTypeLabel(log.actorType) }}</span>
              </td>
              <td class="px-4 py-3.5 text-caption1 text-grey-7 hidden md:table-cell font-mono">
                {{ log.actorId ? log.actorId.slice(0, 8) + '...' : '-' }}
              </td>
              <td class="px-4 py-3.5 text-caption1 text-grey-7 hidden lg:table-cell">
                {{ log.targetType ? `${log.targetType}` : '-' }}
              </td>
              <td class="px-4 py-3.5 text-right text-caption1 text-grey-7 whitespace-nowrap">
                {{ formatDateTime(log.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="data && data.totalPages > 1" class="flex items-center justify-center gap-2">
        <button
          :disabled="currentPage === 0"
          @click="fetchLogs(currentPage - 1)"
          class="rounded-xl border border-grey-5 p-2 text-grey-7 hover:bg-grey-3 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="text-label1 text-grey-8 px-2">{{ currentPage + 1 }} / {{ data.totalPages }}</span>
        <button
          :disabled="currentPage >= data.totalPages - 1"
          @click="fetchLogs(currentPage + 1)"
          class="rounded-xl border border-grey-5 p-2 text-grey-7 hover:bg-grey-3 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>
