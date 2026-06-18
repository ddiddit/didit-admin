<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import BackLink from '@/components/common/BackLink.vue'
import Card from '@/components/common/Card.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { inquiriesApi } from '@/api/inquiries.api'
import type { InquiryDetail } from '@/types/inquiry'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const route = useRoute()
const router = useRouter()

const inquiry = ref<InquiryDetail | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeletingAnswer = ref(false)
const showDeleteAnswerDialog = ref(false)
const isEditing = ref(false)
const answerContent = ref('')

const typeLabel = (type: InquiryDetail['type']) => {
  const map = { USAGE: '이용 문의', BUG: '버그 신고', IMPROVEMENT: '개선 요청', ETC: '기타' }
  return map[type] ?? type
}

const fetchInquiry = async () => {
  isLoading.value = true
  try {
    const id = route.params.id as string
    const response = await inquiriesApi.get(id)
    inquiry.value = response.data.data
    answerContent.value = inquiry.value.adminAnswer ?? ''
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '문의를 불러오지 못했습니다.'))
    router.push('/inquiries')
  } finally {
    isLoading.value = false
  }
}

const handleSubmitAnswer = async () => {
  if (!answerContent.value.trim()) {
    toast.error('답변 내용을 입력해주세요.')
    return
  }
  isSubmitting.value = true
  try {
    const id = route.params.id as string
    const payload = { answer: answerContent.value }
    if (inquiry.value?.adminAnswer) {
      await inquiriesApi.updateAnswer(id, payload)
      toast.success('답변이 수정되었습니다.')
    } else {
      await inquiriesApi.answer(id, payload)
      toast.success('답변이 등록되었습니다.')
    }
    isEditing.value = false
    await fetchInquiry()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '답변 등록에 실패했습니다.'))
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteAnswer = async () => {
  isDeletingAnswer.value = true
  try {
    const id = route.params.id as string
    await inquiriesApi.deleteAnswer(id)
    toast.success('답변이 삭제되었습니다.')
    showDeleteAnswerDialog.value = false
    isEditing.value = false
    await fetchInquiry()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '답변 삭제에 실패했습니다.'))
  } finally {
    isDeletingAnswer.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  answerContent.value = inquiry.value?.adminAnswer ?? ''
}

onMounted(fetchInquiry)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSubmitting || isDeletingAnswer" />

    <div class="mx-auto w-full max-w-2xl space-y-5 pt-2">
      <BackLink @click="router.push('/inquiries')" />

      <template v-if="inquiry">
        <!-- 문의 내용 -->
        <Card class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-caption1 font-semibold uppercase tracking-wide text-grey-7">
              {{ typeLabel(inquiry.type) }}
              <span v-if="inquiry.type === 'ETC' && inquiry.typeEtc" class="text-grey-8">· {{ inquiry.typeEtc }}</span>
            </span>
            <Badge :tone="inquiry.status === 'PENDING' ? 'yellow' : 'green'">
              {{ inquiry.status === 'PENDING' ? '대기' : '답변완료' }}
            </Badge>
          </div>
          <div class="flex flex-col gap-0.5 text-caption1 text-grey-7">
            <span class="truncate">{{ inquiry.email }}</span>
            <span>{{ formatDateTime(inquiry.createdAt) }}</span>
          </div>
          <p class="whitespace-pre-wrap text-label1 leading-relaxed text-grey-10">{{ inquiry.content }}</p>
        </Card>

        <!-- 기존 답변 -->
        <div
          v-if="inquiry.adminAnswer"
          class="space-y-3 rounded-2xl border border-green-light-active bg-green-light px-6 py-5"
        >
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-0.5">
              <h3 class="text-label1 font-semibold text-green-dark">답변</h3>
              <span class="text-caption1 text-grey-7">{{ formatDateTime(inquiry.answeredAt) }}</span>
            </div>
            <div v-if="!isEditing" class="flex items-center gap-2">
              <BaseButton variant="ghost" size="sm" @click="isEditing = true">수정</BaseButton>
              <button
                @click="showDeleteAnswerDialog = true"
                class="rounded-lg border border-grey-5 bg-surface px-3 py-1.5 text-caption1 font-medium text-grey-8 transition hover:bg-danger/10 hover:text-danger cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>

          <p v-if="!isEditing" class="whitespace-pre-wrap text-label1 leading-relaxed text-grey-10">
            {{ inquiry.adminAnswer }}
          </p>

          <template v-else>
            <textarea
              v-model="answerContent"
              rows="5"
              class="w-full resize-none rounded-xl border border-grey-5 bg-surface px-4 py-3 text-label1 text-grey-13 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div class="flex gap-2">
              <BaseButton variant="ghost" block @click="cancelEdit">취소</BaseButton>
              <BaseButton variant="primary" block :loading="isSubmitting" @click="handleSubmitAnswer">
                수정 완료
              </BaseButton>
            </div>
          </template>
        </div>

        <!-- 답변 작성 (답변 없을 때만) -->
        <Card v-if="!inquiry.adminAnswer" class="space-y-4">
          <h3 class="text-label1 font-semibold text-grey-13">답변 작성</h3>
          <textarea
            v-model="answerContent"
            placeholder="답변을 입력해주세요"
            rows="5"
            class="w-full resize-none rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <BaseButton variant="primary" block :loading="isSubmitting" @click="handleSubmitAnswer">
            답변 등록
          </BaseButton>
        </Card>
      </template>
    </div>

    <ConfirmDialog
      v-if="showDeleteAnswerDialog"
      title="답변 삭제"
      description="등록된 답변을 삭제하시겠습니까? 문의 상태가 대기로 변경됩니다."
      confirm-text="삭제"
      :is-danger="true"
      :is-loading="isDeletingAnswer"
      @close="showDeleteAnswerDialog = false"
      @confirm="handleDeleteAnswer"
    />
  </DashboardLayout>
</template>
