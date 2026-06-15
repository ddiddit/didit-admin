<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronRight } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { promptsApi } from '@/api/prompts.api'
import type { Prompt } from '@/types/prompt'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()
const prompts = ref<Prompt[]>([])
const isLoading = ref(false)

const jobLabel = (jobType: string) => {
  const map: Record<string, string> = { DEVELOPER: '개발자', PLANNER: '기획자', DESIGNER: '디자이너' }
  return map[jobType] ?? jobType
}

const typeLabel = (promptType: string) => {
  return promptType === 'DEEP_QUESTION' ? '심화 질문' : '회고 요약'
}

const typeColor = (promptType: string) => {
  return promptType === 'DEEP_QUESTION' ? 'badge-green' : 'badge-grey'
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const ORDER: Record<string, number> = {
  'DEVELOPER_DEEP_QUESTION': 0, 'DEVELOPER_SUMMARY': 1,
  'PLANNER_DEEP_QUESTION': 2, 'PLANNER_SUMMARY': 3,
  'DESIGNER_DEEP_QUESTION': 4, 'DESIGNER_SUMMARY': 5,
}

const sortedPrompts = () =>
  [...prompts.value].sort((a, b) =>
    (ORDER[`${a.jobType}_${a.promptType}`] ?? 99) - (ORDER[`${b.jobType}_${b.promptType}`] ?? 99)
  )

const fetchPrompts = async () => {
  isLoading.value = true
  try {
    const res = await promptsApi.list()
    prompts.value = res.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '프롬프트 목록을 불러오지 못했습니다.')
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
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">프롬프트 관리</h2>
        <p class="mt-0.5 text-label1 text-grey-7">직무별 AI 회고 프롬프트를 조회하고 수정할 수 있습니다.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="prompt in sortedPrompts()"
          :key="prompt.id"
          class="group rounded-2xl bg-surface border border-grey-5 p-5 cursor-pointer hover:border-primary/50 hover:shadow-card transition"
          @click="router.push(`/prompts/${prompt.id}`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1.5">
              <span :class="typeColor(prompt.promptType)" class="text-caption1">{{ typeLabel(prompt.promptType) }}</span>
              <h3 class="text-body3 font-semibold text-grey-13">{{ jobLabel(prompt.jobType) }}</h3>
            </div>
            <ChevronRight class="w-4 h-4 text-grey-6 group-hover:text-primary transition flex-shrink-0 mt-1" />
          </div>

          <p class="mt-3 text-caption1 text-grey-7 line-clamp-3 leading-relaxed">
            {{ prompt.content.slice(0, 120) }}...
          </p>

          <div class="mt-4 pt-3 border-t border-grey-4">
            <p class="text-caption2 text-grey-6">마지막 수정: {{ formatDate(prompt.updatedAt) }}</p>
            <p v-if="prompt.updatedBy" class="text-caption2 text-grey-6 truncate">by {{ prompt.updatedBy }}</p>
          </div>
        </div>

        <div v-if="!isLoading && prompts.length === 0" class="col-span-full py-16 text-center text-label1 text-grey-7">
          프롬프트가 없습니다. 서버를 확인해주세요.
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
