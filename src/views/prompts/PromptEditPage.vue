<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import BackLink from '@/components/common/BackLink.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { promptsApi } from '@/api/prompts.api'
import type { Prompt } from '@/types/prompt'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const route = useRoute()
const router = useRouter()

const prompt = ref<Prompt | null>(null)
const editContent = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const showSaveDialog = ref(false)

const isDirty = computed(() => prompt.value !== null && editContent.value !== prompt.value.content)

const jobLabel = (jobType: string) => {
  const map: Record<string, string> = { DEVELOPER: '개발자', PLANNER: '기획자', DESIGNER: '디자이너' }
  return map[jobType] ?? jobType
}
const typeLabel = (promptType: string) => (promptType === 'DEEP_QUESTION' ? '심화 질문' : '회고 요약')

const fetchPrompt = async () => {
  isLoading.value = true
  try {
    const res = await promptsApi.get(route.params.id as string)
    prompt.value = res.data.data
    editContent.value = res.data.data.content
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '프롬프트를 불러오지 못했습니다.'))
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
    toast.error(getErrorMessage(error, '저장에 실패했습니다.'))
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchPrompt)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSaving" />

    <div class="mx-auto w-full max-w-4xl space-y-5 pt-2">
      <BackLink @click="router.push('/prompts')" />

      <template v-if="prompt">
        <!-- 헤더 -->
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone="green">{{ typeLabel(prompt.promptType) }}</Badge>
            <h2 class="text-heading2 font-semibold text-grey-13">{{ jobLabel(prompt.jobType) }} 프롬프트</h2>
          </div>
          <p class="mt-1 text-caption1 text-grey-7">마지막 수정: {{ formatDateTime(prompt.updatedAt) }}</p>
        </div>

        <!-- 에디터 -->
        <div class="overflow-hidden rounded-2xl border border-grey-5 bg-surface">
          <div class="flex items-center justify-between border-b border-grey-5 bg-grey-3 px-4 py-3">
            <p class="text-caption1 font-medium text-grey-7">프롬프트 내용</p>
            <p class="text-caption2 text-grey-6">{{ editContent.length.toLocaleString() }}자</p>
          </div>
          <textarea
            v-model="editContent"
            class="h-[60vh] w-full resize-none bg-surface p-4 font-mono text-caption1 leading-relaxed text-grey-13 outline-none"
            spellcheck="false"
          />
        </div>

        <!-- 저장 버튼 (에디터 하단) -->
        <BaseButton
          variant="primary"
          size="lg"
          block
          :disabled="!isDirty"
          :loading="isSaving"
          @click="showSaveDialog = true"
        >
          저장
        </BaseButton>
      </template>
    </div>

    <ConfirmDialog
      v-if="showSaveDialog"
      title="프롬프트 저장"
      description="수정된 프롬프트를 저장하시겠습니까? 즉시 AI 회고 챗봇에 적용됩니다."
      confirm-text="저장"
      :is-loading="isSaving"
      @close="showSaveDialog = false"
      @confirm="handleSave"
    />
  </DashboardLayout>
</template>
