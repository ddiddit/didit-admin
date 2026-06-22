<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { ClipboardList } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
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

// 액션 필터 옵션은 서버 응답(action·actionLabel)에서 누적 수집한다.
// 별도 액션 목록 API가 없어, 조회된 로그에 등장한 액션을 모아 드롭다운을 구성한다.
const actionLabelMap = ref<Record<string, string>>({})

const ACTION_OPTIONS = computed(() => [
  { value: '', label: '전체 액션' },
  ...Object.entries(actionLabelMap.value)
    .sort((a, b) => a[1].localeCompare(b[1], 'ko'))
    .map(([value, label]) => ({ value, label })),
])

const ACTOR_OPTIONS = [
  { value: '', label: '전체 유형' },
  { value: 'USER', label: '사용자' },
  { value: 'ADMIN', label: '어드민' },
  { value: 'SYSTEM', label: '시스템' },
]

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
    // 응답에 등장한 액션 라벨을 누적해 필터 옵션을 갱신한다.
    for (const item of res.data.data.content) {
      if (item.action) actionLabelMap.value[item.action] = item.actionLabel || item.action
    }
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

      <!-- 필터 (선택 즉시 조회) -->
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SelectField
          :model-value="filterAction"
          :options="ACTION_OPTIONS"
          @update:model-value="(v) => { filterAction = v; fetchLogs(0) }"
        />
        <SelectField
          :model-value="filterActorType"
          :options="ACTOR_OPTIONS"
          @update:model-value="(v) => { filterActorType = v; fetchLogs(0) }"
        />
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
          <span class="font-medium">{{ row.actionLabel || row.action }}</span>
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
