<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { ClipboardList } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SelectField from '@/components/common/SelectField.vue'
import Pagination from '@/components/common/Pagination.vue'
import { auditLogApi } from '@/api/auditLog.api'
import type { AuditLogsPage } from '@/types/auditLog'
import { formatDateTimeSec } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const data = ref<AuditLogsPage | null>(null)
const isLoading = ref(false)
const filterAction = ref('')
const filterActorType = ref('')
const currentPage = ref(0)

const columns = [
  { key: 'action', label: '액션', align: 'left' as const },
  { key: 'actorType', label: '유형', align: 'center' as const },
  { key: 'actorId', label: 'Actor ID', align: 'left' as const, hideBelow: 'md' as const },
  { key: 'targetType', label: 'Target', align: 'left' as const, hideBelow: 'lg' as const },
  { key: 'createdAt', label: '발생 시각', align: 'right' as const },
]

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

const actionLabel = (action: string) => ACTION_OPTIONS.find(o => o.value === action)?.label ?? action
const actorTypeLabel = (type: string | null) =>
  !type ? '-' : ACTOR_OPTIONS.find(o => o.value === type)?.label ?? type

const actorTone = (type: string | null): 'green' | 'yellow' | 'grey' =>
  type === 'USER' ? 'green' : type === 'ADMIN' ? 'yellow' : 'grey'

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
    toast.error(getErrorMessage(error, '감사 로그를 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchLogs(0))
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="감사 로그" subtitle="사용자 및 어드민의 주요 행동 기록을 조회합니다." />

      <!-- 필터 -->
      <div class="flex flex-wrap items-center gap-2">
        <SelectField v-model="filterAction" :options="ACTION_OPTIONS" />
        <SelectField v-model="filterActorType" :options="ACTOR_OPTIONS" />
        <BaseButton variant="primary" @click="fetchLogs(0)">조회</BaseButton>
      </div>

      <DataTable
        :columns="columns"
        :rows="data?.content ?? []"
        :row-key="(_, idx) => idx"
        min-width="min-w-[700px]"
        :loading="isLoading"
        empty-message="로그가 없습니다."
        :empty-icon="ClipboardList"
      >
        <template #cell-action="{ row }">
          <span class="font-medium">{{ actionLabel(row.action) }}</span>
          <span class="ml-1.5 hidden text-caption2 text-grey-6 sm:inline">{{ row.action }}</span>
        </template>
        <template #cell-actorType="{ row }">
          <Badge :tone="actorTone(row.actorType)">{{ actorTypeLabel(row.actorType) }}</Badge>
        </template>
        <template #cell-actorId="{ row }">
          <span class="font-mono text-caption1 text-grey-7">{{ row.actorId ? row.actorId.slice(0, 8) + '…' : '-' }}</span>
        </template>
        <template #cell-targetType="{ row }">
          <span class="text-caption1 text-grey-7">{{ row.targetType || '-' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="whitespace-nowrap text-caption1 text-grey-7">{{ formatDateTimeSec(row.createdAt) }}</span>
        </template>
      </DataTable>

      <Pagination
        v-if="data"
        :page="currentPage"
        :total-pages="data.totalPages"
        @change="fetchLogs"
      />
    </div>
  </DashboardLayout>
</template>
