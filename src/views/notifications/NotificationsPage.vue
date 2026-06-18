<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Send } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Card from '@/components/common/Card.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import { notificationsApi } from '@/api/notifications.api'
import { auditLogApi } from '@/api/auditLog.api'
import type { AuditLogItem } from '@/types/auditLog'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const isSending = ref(false)
const title = ref('')
const body = ref('')

const history = ref<AuditLogItem[]>([])
const isLoadingHistory = ref(false)

const columns = [
  { key: 'createdAt', label: '발송 일시', align: 'left' as const },
  { key: 'target', label: '대상', align: 'center' as const },
  { key: 'targetCount', label: '대상 수', align: 'center' as const },
  { key: 'sentCount', label: '성공', align: 'center' as const },
  { key: 'failedCount', label: '실패', align: 'center' as const },
]

const targetTypeLabel = (payload: Record<string, unknown> | null) => {
  const type = payload?.targetType
  return type === 'ALL' ? '전체 사용자' : type === 'SELECTED_USERS' ? '선택 사용자' : '-'
}

const payloadNum = (payload: Record<string, unknown> | null, key: string): string => {
  const val = payload?.[key]
  return typeof val === 'number' ? val.toLocaleString() : '-'
}

const fetchHistory = async () => {
  isLoadingHistory.value = true
  try {
    const res = await auditLogApi.list({ action: 'ADMIN_NOTICE_EMAIL_SENT', page: 0 })
    history.value = res.data.data.content
  } catch {
    // 이력 로딩 실패는 조용히 처리
  } finally {
    isLoadingHistory.value = false
  }
}

const handleSend = async () => {
  if (!title.value.trim() || !body.value.trim()) {
    toast.error('제목과 내용을 입력해주세요.')
    return
  }
  isSending.value = true
  try {
    await notificationsApi.sendNoticeEmail({
      targetType: 'ALL',
      userIds: [],
      subject: title.value.trim(),
      body: body.value.trim(),
    })
    toast.success('이메일이 발송되었습니다.')
    title.value = ''
    body.value = ''
    await fetchHistory()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '이메일 발송에 실패했습니다.'))
  } finally {
    isSending.value = false
  }
}

onMounted(fetchHistory)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isSending" />

    <div class="mx-auto w-full max-w-6xl space-y-6 pt-2">
      <PageHeader title="알림 발송" subtitle="전체 사용자에게 이메일을 발송합니다." />

      <!-- PC: 좌(작성) / 우(발송 이력) 2단, 모바일: 세로 스택 -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
        <!-- 왼쪽: 작성 -->
        <div class="space-y-4">
          <Card class="space-y-4">
            <div>
              <label class="mb-1.5 block text-label1 font-medium text-grey-9">제목</label>
              <input
                v-model="title"
                type="text"
                placeholder="이메일 제목을 입력해주세요"
                class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-label1 font-medium text-grey-9">내용</label>
              <textarea
                v-model="body"
                placeholder="이메일 내용을 입력해주세요"
                rows="6"
                class="w-full resize-none rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>

          <BaseButton variant="primary" size="lg" block :loading="isSending" @click="handleSend">
            <Send v-if="!isSending" class="h-5 w-5" />
            {{ isSending ? '발송 중...' : '발송하기' }}
          </BaseButton>
        </div>

        <!-- 오른쪽: 발송 이력 -->
        <DataTable
          :columns="columns"
          :rows="history"
          :row-key="(_, idx) => idx"
          min-width="min-w-[560px]"
          min-height="lg:min-h-[420px]"
          :loading="isLoadingHistory"
          empty-message="발송 이력이 없습니다."
          :empty-icon="Send"
        >
          <template #cell-createdAt="{ row }">
            <span class="whitespace-nowrap">{{ formatDateTime(row.createdAt) }}</span>
          </template>
          <template #cell-target="{ row }">
            <Badge tone="grey">{{ targetTypeLabel(row.payload) }}</Badge>
          </template>
          <template #cell-targetCount="{ row }">
            <span class="text-grey-10">{{ payloadNum(row.payload, 'targetCount') }}명</span>
          </template>
          <template #cell-sentCount="{ row }">
            <span class="font-semibold text-primary">{{ payloadNum(row.payload, 'sentCount') }}</span>
          </template>
          <template #cell-failedCount="{ row }">
            <span
              class="font-semibold"
              :class="((row.payload?.failedCount as number) ?? 0) > 0 ? 'text-danger' : 'text-grey-7'"
            >
              {{ payloadNum(row.payload, 'failedCount') }}
            </span>
          </template>
        </DataTable>
      </div>
    </div>
  </DashboardLayout>
</template>
