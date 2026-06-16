<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { notificationsApi } from '@/api/notifications.api'
import { auditLogApi } from '@/api/auditLog.api'
import type { AuditLogItem } from '@/types/auditLog'
import type { ProblemDetail } from '@/types/api'

const isSending = ref(false)
const title = ref('')
const body = ref('')

// 발송 이력
const history = ref<AuditLogItem[]>([])
const isLoadingHistory = ref(false)

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

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
    // 발송 후 이력 갱신
    await fetchHistory()
  } catch (error: unknown) {
    const problem = (error as { response?: { data?: ProblemDetail } })?.response?.data
    toast.error(problem?.detail || '이메일 발송에 실패했습니다.')
  } finally {
    isSending.value = false
  }
}

onMounted(fetchHistory)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isSending" />

    <div class="flex min-h-full justify-center pt-10">
      <div class="w-full max-w-2xl space-y-6">

        <!-- 헤더 -->
        <div>
          <h2 class="text-heading2 font-semibold text-grey-13">알림 발송</h2>
          <p class="mt-0.5 text-label1 text-grey-7">전체 사용자에게 이메일을 발송합니다.</p>
        </div>

        <!-- 내용 입력 -->
        <div class="bg-surface rounded-2xl border border-grey-5 px-6 py-5 space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">내용</h3>

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
              rows="4"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <!-- 발송 버튼 -->
        <BaseButton type="button" :disabled="isSending" @click="handleSend">
          {{ isSending ? '발송 중...' : '발송하기' }}
        </BaseButton>

        <!-- 발송 이력 -->
        <div class="space-y-3">
          <h3 class="text-label1 font-semibold text-grey-13">발송 이력</h3>

          <div class="rounded-2xl bg-surface border border-grey-5 overflow-hidden">
            <div v-if="isLoadingHistory" class="py-10 text-center text-caption1 text-grey-7">
              불러오는 중...
            </div>

            <div v-else-if="history.length === 0" class="py-10 text-center text-caption1 text-grey-7">
              발송 이력이 없습니다.
            </div>

            <table v-else class="w-full text-sm">
              <thead>
                <tr class="border-b border-grey-5 bg-grey-3">
                  <th class="px-5 py-3.5 text-left text-caption1 font-semibold text-grey-7">발송 일시</th>
                  <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">대상</th>
                  <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">대상 수</th>
                  <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">성공</th>
                  <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">실패</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-grey-4">
                <tr
                  v-for="(item, idx) in history"
                  :key="idx"
                  class="hover:bg-grey-3 transition"
                >
                  <td class="px-5 py-3.5 text-label1 text-grey-13 whitespace-nowrap">
                    {{ formatDateTime(item.createdAt) }}
                  </td>
                  <td class="px-5 py-3.5 text-center">
                    <span class="badge-grey">{{ targetTypeLabel(item.payload) }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-center text-label1 text-grey-10">
                    {{ payloadNum(item.payload, 'targetCount') }}명
                  </td>
                  <td class="px-5 py-3.5 text-center text-label1 font-semibold text-primary">
                    {{ payloadNum(item.payload, 'sentCount') }}
                  </td>
                  <td class="px-5 py-3.5 text-center text-label1 font-semibold"
                    :class="(item.payload?.failedCount as number ?? 0) > 0 ? 'text-danger' : 'text-grey-7'">
                    {{ payloadNum(item.payload, 'failedCount') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>
