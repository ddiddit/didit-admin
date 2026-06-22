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
import type { AuditLogsPage, AuditActionOption } from '@/types/auditLog'
import { formatDateTimeSec } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const data = ref<AuditLogsPage | null>(null)
const isLoading = ref(false)
const filterAction = ref('')
const filterActorType = ref('')
const currentPage = ref(0)
const actions = ref<AuditActionOption[]>([])

const columns = [
  { key: 'action', label: '액션', align: 'left' as const },
  { key: 'actorType', label: '유형', align: 'center' as const },
  { key: 'actorId', label: 'Actor ID', align: 'left' as const, hideBelow: 'md' as const },
  { key: 'targetType', label: 'Target', align: 'left' as const, hideBelow: 'lg' as const },
  { key: 'createdAt', label: '발생 시각', align: 'right' as const },
]

const ACTOR_OPTIONS = [
  { value: '', label: '전체 유형' },
  { value: 'USER', label: '사용자' },
  { value: 'ADMIN', label: '어드민' },
  { value: 'SYSTEM', label: '시스템' },
]

// 액션 옵션은 전체 액션 목록 API로 구성한다.
// 유형(actorType)이 선택돼 있으면 해당 유형의 액션만 노출한다.
const ACTION_OPTIONS = computed(() => {
  const filtered = filterActorType.value
    ? actions.value.filter((a) => a.actorType === filterActorType.value)
    : actions.value
  return [
    { value: '', label: '전체 액션' },
    ...filtered
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, 'ko'))
      .map((a) => ({ value: a.action, label: a.label })),
  ]
})

const actorTypeLabel = (type: string | null) =>
  !type ? '-' : ACTOR_OPTIONS.find(o => o.value === type)?.label ?? type

const actorTone = (type: string | null): 'green' | 'yellow' | 'grey' =>
  type === 'USER' ? 'green' : type === 'ADMIN' ? 'yellow' : 'grey'

// 전체 액션 목록 로드 (드롭다운 구성용). 실패해도 조회 자체엔 영향 없으므로 조용히 무시한다.
const fetchActions = async () => {
  try {
    const res = await auditLogApi.actions()
    actions.value = res.data.data
  } catch {
    // 액션 목록 로드 실패 — 필터만 비활성, 로그 조회는 정상 동작
  }
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
    toast.error(getErrorMessage(error, '감사 로그를 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

// 유형 변경 시 현재 선택된 액션이 그 유형에 속하지 않으면 액션 필터를 초기화한다.
const onActorTypeChange = (v: string) => {
  filterActorType.value = v
  if (filterAction.value && !ACTION_OPTIONS.value.some((o) => o.value === filterAction.value)) {
    filterAction.value = ''
  }
  fetchLogs(0)
}

const onActionChange = (v: string) => {
  filterAction.value = v
  fetchLogs(0)
}

onMounted(() => {
  fetchActions()
  fetchLogs(0)
})
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="감사 로그" subtitle="사용자 및 어드민의 주요 행동 기록을 조회합니다." />

      <!-- 필터 (선택 즉시 조회) — 유형(상위)이 왼쪽, 액션이 오른쪽 -->
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SelectField
          :model-value="filterActorType"
          :options="ACTOR_OPTIONS"
          @update:model-value="onActorTypeChange"
        />
        <SelectField
          :model-value="filterAction"
          :options="ACTION_OPTIONS"
          @update:model-value="onActionChange"
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
