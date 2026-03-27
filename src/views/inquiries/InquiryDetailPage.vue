v<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronLeft } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import type { ProblemDetail } from '@/types/api'

interface Inquiry {
  id: number
  title: string
  content: string
  authorEmail: string
  status: 'PENDING' | 'ANSWERED'
  createdAt: string
  answer: string | null
  answeredAt: string | null
}

const router = useRouter()
const route = useRoute()
const _id = route.params.id as string

const inquiry = ref<Inquiry | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const answerContent = ref('')

const fetchInquiry = async () => {
  isLoading.value = true
  try {
    // const response = await inquiriesApi.get(id)
    // inquiry.value = response.data.data
    // answerContent.value = inquiry.value.answer ?? ''
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
    // await inquiriesApi.answer(id, { content: answerContent.value })
    toast.success('답변이 등록되었습니다.')
    await fetchInquiry()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '답변 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
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
    <BaseSpinner :show="isLoading || isSubmitting" />

    <div class="flex min-h-full justify-center pt-10">
      <div class="w-full max-w-2xl space-y-5">

        <!-- 뒤로가기 -->
        <button
            @click="router.push('/inquiries')"
            class="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
        >
          <ChevronLeft class="w-4 h-4" />
          목록으로
        </button>

        <template v-if="inquiry">

          <!-- 문의 내용 -->
          <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semibold text-neutral-900">{{ inquiry.title }}</h2>
              <span :class="[
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                inquiry.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-primary/10 text-primary'
              ]">
                {{ inquiry.status === 'PENDING' ? '대기' : '답변완료' }}
              </span>
            </div>
            <div class="text-xs text-neutral-400">
              {{ inquiry.authorEmail }} · {{ formatDate(inquiry.createdAt) }}
            </div>
            <p class="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {{ inquiry.content }}
            </p>
          </div>

          <!-- 기존 답변 -->
          <div v-if="inquiry.answer" class="bg-primary/5 rounded-2xl border border-primary/20 px-6 py-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-primary">답변</h3>
              <span class="text-xs text-neutral-400">{{ formatDate(inquiry.answeredAt!) }}</span>
            </div>
            <p class="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {{ inquiry.answer }}
            </p>
          </div>

          <!-- 답변 작성 -->
          <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900">
              {{ inquiry.answer ? '답변 수정' : '답변 작성' }}
            </h3>
            <textarea
                v-model="answerContent"
                :placeholder="inquiry.answer ? '답변을 수정해주세요' : '답변을 입력해주세요'"
                rows="5"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <BaseButton type="button" :disabled="isSubmitting" @click="handleSubmitAnswer">
              {{ inquiry.answer ? '답변 수정' : '답변 등록' }}
            </BaseButton>
          </div>

        </template>

      </div>
    </div>
  </DashboardLayout>
</template>