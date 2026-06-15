<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronLeft } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { promptsApi } from '@/api/prompts.api'
import { tokenStorage } from '@/utils/token'
import type { Prompt } from '@/types/prompt'
import type { ProblemDetail } from '@/types/api'

const route = useRoute()
const router = useRouter()

const prompt = ref<Prompt | null>(null)
const editContent = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const showSaveDialog = ref(false)

const isSuperAdmin = computed(() => tokenStorage.isSuperAdmin())
const isDirty = computed(() => prompt.value !== null && editContent.value !== prompt.value.content)

const jobLabel = (jobType: string) => {
  const map: Record<string, string> = { DEVELOPER: '개발자', PLANNER: '기획자', DESIGNER: '디자이너' }
  return map[jobType] ?? jobType
}

const typeLabel = (promptType: string) => {
  return promptType === 'DEEP_QUESTION' ? '심화 질문' : '회고 요약'
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const fetchPrompt = async () => {
  isLoading.value = true
  try {
    const res = await promptsApi.get(route.params.id as string)
    prompt.value = res.data.data
    editContent.value = res.data.data.content
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '프롬프트를 불러오지 못했습니다.')
    router.push('/prompts')
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  isSaving.value = true
  try {
    const res = await promptsApi.update(route.params.id as string, editContent.value)
    prompt.value = res.data.data
    editContent.value = res.data.data.content
    toast.success('프롬프트가 저장되었습니다.')
    showSaveDialog.value = false
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchPrompt)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSaving" />

    <div class="space-y-5 max-w-4xl mx-auto">
      <!-- 뒤로가기 -->
      <button
        @click="router.push('/prompts')"
        class="flex items-center gap-1 text-label1 text-grey-7 hover:text-grey-9 transition cursor-pointer"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>목록으로</span>
      </button>

      <template v-if="prompt">
        <!-- 헤더 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge-green">{{ typeLabel(prompt.promptType) }}</span>
              <h2 class="text-heading2 font-semibold text-grey-13">{{ jobLabel(prompt.jobType) }} 프롬프트</h2>
            </div>
            <p class="mt-1 text-caption1 text-grey-7">마지막 수정: {{ formatDate(prompt.updatedAt) }}</p>
          </div>
          <button
            v-if="isSuperAdmin"
            :disabled="!isDirty"
            @click="showSaveDialog = true"
            class="rounded-xl bg-primary px-5 py-2.5 text-label1 font-semibold text-white hover:bg-green-hover transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
          >
            저장
          </button>
        </div>

        <!-- 에디터 -->
        <div class="rounded-2xl bg-surface border border-grey-5 overflow-hidden">
          <div class="px-4 py-3 border-b border-grey-5 bg-grey-3 flex items-center justify-between">
            <p class="text-caption1 font-medium text-grey-7">프롬프트 내용</p>
            <p class="text-caption2 text-grey-6">{{ editContent.length.toLocaleString() }}자</p>
          </div>
          <textarea
            v-model="editContent"
            :readonly="!isSuperAdmin"
            class="w-full h-[60vh] p-4 font-mono text-caption1 text-grey-13 bg-surface resize-none outline-none leading-relaxed"
            :class="!isSuperAdmin ? 'cursor-default opacity-80' : ''"
            spellcheck="false"
          />
        </div>

        <p v-if="!isSuperAdmin" class="text-caption1 text-grey-7 text-center">
          프롬프트 수정은 슈퍼어드민만 가능합니다.
        </p>
      </template>
    </div>

    <ConfirmDialog
      v-if="showSaveDialog"
      title="프롬프트 저장"
      description="수정된 프롬프트를 저장하시겠습니까? 즉시 AI 회고 챗봇에 적용됩니다."
      confirm-text="저장"
      :is-danger="false"
      :is-loading="isSaving"
      @close="showSaveDialog = false"
      @confirm="handleSave"
    />
  </DashboardLayout>
</template>
