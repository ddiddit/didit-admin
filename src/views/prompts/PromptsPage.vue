<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronRight } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Badge from '@/components/common/Badge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { promptsApi } from '@/api/prompts.api'
import type { Prompt } from '@/types/prompt'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()
const prompts = ref<Prompt[]>([])
const isLoading = ref(false)

const jobLabel = (jobType: string) => {
  const map: Record<string, string> = { DEVELOPER: '개발자', PLANNER: '기획자', DESIGNER: '디자이너' }
  return map[jobType] ?? jobType
}
const typeLabel = (promptType: string) => (promptType === 'DEEP_QUESTION' ? '심화 질문' : '회고 요약')
const typeTone = (promptType: string): 'green' | 'grey' => (promptType === 'DEEP_QUESTION' ? 'green' : 'grey')

const ORDER: Record<string, number> = {
  DEVELOPER_DEEP_QUESTION: 0, DEVELOPER_SUMMARY: 1,
  PLANNER_DEEP_QUESTION: 2, PLANNER_SUMMARY: 3,
  DESIGNER_DEEP_QUESTION: 4, DESIGNER_SUMMARY: 5,
}

const sortedPrompts = computed(() =>
  [...prompts.value].sort((a, b) =>
    (ORDER[`${a.jobType}_${a.promptType}`] ?? 99) - (ORDER[`${b.jobType}_${b.promptType}`] ?? 99)
  )
)

const fetchPrompts = async () => {
  isLoading.value = true
  try {
    const res = await promptsApi.list()
    prompts.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '프롬프트 목록을 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPrompts)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="프롬프트 관리" subtitle="직무별 AI 회고 프롬프트를 조회하고 수정할 수 있습니다." />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="prompt in sortedPrompts"
          :key="prompt.id"
          class="group cursor-pointer rounded-2xl border border-grey-5 bg-surface p-5 transition hover:border-primary/50 hover:shadow-card"
          @click="router.push(`/prompts/${prompt.id}`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1.5">
              <Badge :tone="typeTone(prompt.promptType)">{{ typeLabel(prompt.promptType) }}</Badge>
              <h3 class="text-body3 font-semibold text-grey-13">{{ jobLabel(prompt.jobType) }}</h3>
            </div>
            <ChevronRight class="mt-1 h-4 w-4 shrink-0 text-grey-6 transition group-hover:text-primary" />
          </div>
          <p class="mt-3 line-clamp-3 text-caption1 leading-relaxed text-grey-7">
            {{ prompt.content.slice(0, 120) }}…
          </p>
          <div class="mt-4 border-t border-grey-4 pt-3">
            <p class="text-caption2 text-grey-6">마지막 수정: {{ formatDateTime(prompt.updatedAt) }}</p>
            <p v-if="prompt.updatedBy" class="truncate text-caption2 text-grey-6">by {{ prompt.updatedBy }}</p>
          </div>
        </div>

        <EmptyState
          v-if="!isLoading && prompts.length === 0"
          class="col-span-full"
          message="프롬프트가 없습니다."
          description="서버 상태를 확인해주세요."
        />
      </div>
    </div>
  </DashboardLayout>
</template>
