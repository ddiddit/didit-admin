<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronLeft } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { inquiriesApi } from '@/api/inquiries.api'
import type { InquiryDetail } from '@/types/inquiry'
import type { ProblemDetail } from '@/types/api'

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
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '문의를 불러오지 못했습니다.')
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
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '답변 등록에 실패했습니다.')
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
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '답변 삭제에 실패했습니다.')
  } finally {
    isDeletingAnswer.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  answerContent.value = inquiry.value?.adminAnswer ?? ''
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

onMounted(fetchInquiry)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSubmitting || isDeletingAnswer" />

    <div class="flex min-h-full justify-center pt-10">
      <div class="w-full max-w-2xl space-y-5">

        <!-- 뒤로가기 -->
        <button
          @click="router.push('/inquiries')"
          class="flex items-center gap-1 text-label1 text-grey-7 hover:text-grey-9 transition cursor-pointer"
        >
          <ChevronLeft class="w-4 h-4" />
          <span>목록으로</span>
        </button>

        <template v-if="inquiry">

          <!-- 문의 내용 -->
          <div class="bg-surface rounded-2xl border border-grey-5 px-6 py-5 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-caption1 font-semibold text-grey-7 uppercase tracking-wide">
                {{ typeLabel(inquiry.type) }}
                <span v-if="inquiry.type === 'ETC' && inquiry.typeEtc" class="text-grey-8">
                  · {{ inquiry.typeEtc }}
                </span>
              </span>
              <span :class="inquiry.status === 'PENDING' ? 'badge-yellow' : 'badge-green'">
                {{ inquiry.status === 'PENDING' ? '대기' : '답변완료' }}
              </span>
            </div>
            <div class="flex flex-col gap-0.5 text-caption1 text-grey-7">
              <span class="truncate">{{ inquiry.email }}</span>
              <span>{{ formatDate(inquiry.createdAt) }}</span>
            </div>
            <p class="text-label1 text-grey-10 whitespace-pre-wrap leading-relaxed">
              {{ inquiry.content }}
            </p>
          </div>

          <!-- 기존 답변 -->
          <div v-if="inquiry.adminAnswer" class="bg-green-light rounded-2xl border border-green-light-active px-6 py-5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-0.5">
                <h3 class="text-label1 font-semibold text-green-dark">답변</h3>
                <span class="text-caption1 text-grey-7">{{ formatDate(inquiry.answeredAt!) }}</span>
              </div>
              <div v-if="!isEditing" class="flex items-center gap-2">
                <button
                  @click="isEditing = true"
                  class="rounded-lg bg-surface px-3 py-1.5 text-caption1 font-medium text-grey-8 hover:bg-grey-3 transition cursor-pointer border border-grey-5"
                >
                  수정
                </button>
                <button
                  @click="showDeleteAnswerDialog = true"
                  class="rounded-lg bg-surface px-3 py-1.5 text-caption1 font-medium text-grey-8 hover:bg-danger/10 hover:text-danger transition cursor-pointer border border-grey-5"
                >
                  삭제
                </button>
              </div>
            </div>

            <!-- 뷰 모드 -->
            <p v-if="!isEditing" class="text-label1 text-grey-10 whitespace-pre-wrap leading-relaxed">
              {{ inquiry.adminAnswer }}
            </p>

            <!-- 편집 모드 -->
            <template v-else>
              <textarea
                v-model="answerContent"
                rows="5"
                class="w-full rounded-xl border border-grey-5 bg-surface px-4 py-3 text-label1 text-grey-13 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <div class="flex gap-2">
                <button
                  @click="cancelEdit"
                  class="flex-1 rounded-xl border border-grey-5 py-2.5 text-label1 font-medium text-grey-7 hover:bg-grey-3 transition cursor-pointer"
                >
                  취소
                </button>
                <BaseButton type="button" class="flex-1" :disabled="isSubmitting" @click="handleSubmitAnswer">
                  수정 완료
                </BaseButton>
              </div>
            </template>
          </div>

          <!-- 답변 작성 (답변 없을 때만) -->
          <div v-if="!inquiry.adminAnswer" class="bg-surface rounded-2xl border border-grey-5 px-6 py-5 space-y-4">
            <h3 class="text-label1 font-semibold text-grey-13">답변 작성</h3>
            <textarea
              v-model="answerContent"
              placeholder="답변을 입력해주세요"
              rows="5"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <BaseButton type="button" :disabled="isSubmitting" @click="handleSubmitAnswer">
              답변 등록
            </BaseButton>
          </div>

        </template>
      </div>
    </div>

    <!-- 답변 삭제 다이얼로그 -->
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
