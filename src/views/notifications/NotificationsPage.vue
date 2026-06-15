<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { notificationsApi } from '@/api/notifications.api'
import type { ProblemDetail } from '@/types/api'

const isSending = ref(false)
const title = ref('')
const body = ref('')

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
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '이메일 발송에 실패했습니다.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isSending" />

    <div class="flex min-h-full justify-center pt-10">
      <div class="w-full max-w-2xl space-y-5">

        <!-- 헤더 -->
        <div>
          <h2 class="text-heading2 font-semibold text-grey-13">알림 발송</h2>
          <p class="mt-0.5 text-label1 text-grey-7">전체 사용자에게 이메일을 발송합니다.</p>
        </div>

        <!-- 내용 -->
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
          {{ isSending ? '발송 중' : '발송하기' }}
        </BaseButton>

      </div>
    </div>
  </DashboardLayout>
</template>
