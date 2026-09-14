<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from 'vue'
import { RotateCcw, Send } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Card from '@/components/common/Card.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SelectField from '@/components/common/SelectField.vue'
import { promptsApi } from '@/api/prompts.api'
import type { PromptJobType } from '@/types/prompt'
import type {
  PromptSource,
  RetrospectiveItemStatus,
  RetrospectiveItemType,
  RetrospectiveTestState,
  UserExperience,
} from '@/types/retrospectiveTest'
import {
  createEmptyAnalysisItems,
  createPreviewRequest,
  isTestConfigurationLocked,
} from '@/utils/retrospectiveTest'
import { getErrorMessage } from '@/utils/error'
import { formatNumber } from '@/utils/format'

const job = ref<PromptJobType>('DEVELOPER')
const experience = ref<UserExperience>('YEARS_1_TO_2')
const promptSource = ref<PromptSource>('SAVED')
const draftPrompt = ref('')
const message = ref('')
const state = ref<RetrospectiveTestState | null>(null)
const isSending = ref(false)
const messageList = ref<HTMLElement | null>(null)
const emptyAnalysisItems = createEmptyAnalysisItems()
let activeRequest: AbortController | null = null

const isStarted = computed(() => state.value !== null)
const isConfigurationLocked = computed(() =>
  isTestConfigurationLocked(state.value, isSending.value),
)
const analysisItems = computed(() => state.value?.analysisItems ?? emptyAnalysisItems)
const progress = computed(() => ({
  filledCount: analysisItems.value.filter((item) => item.status !== 'EMPTY').length,
  totalCount: analysisItems.value.length,
}))
const canSend = computed(() =>
  message.value.trim().length > 0
  && (promptSource.value === 'SAVED' || draftPrompt.value.trim().length > 0)
  && !isSending.value,
)

const jobOptions = [
  { value: 'DEVELOPER', label: '개발자' },
  { value: 'PLANNER', label: '기획자' },
  { value: 'DESIGNER', label: '디자이너' },
]

const experienceOptions = [
  { value: 'LESS_THAN_1_YEAR', label: '1년 미만' },
  { value: 'YEARS_1_TO_2', label: '1~2년' },
  { value: 'YEARS_3_TO_5', label: '3~5년' },
  { value: 'YEARS_6_TO_9', label: '6~9년' },
  { value: 'YEARS_10_PLUS', label: '10년 이상' },
]

const itemLabels: Record<RetrospectiveItemType, string> = {
  FACT: '사실',
  FEEL: '감정',
  STRENGTH: '강점',
  BLOCK: '방해 요소',
  PROCESS: '과정',
  LEARN: '배움',
  ACTION: '다음 행동',
}

const statusLabels: Record<RetrospectiveItemStatus, string> = {
  EMPTY: '비어 있음',
  PARTIAL: '일부 수집',
  ENOUGH: '충분함',
}

const statusTone = (status: RetrospectiveItemStatus): 'grey' | 'yellow' | 'green' => {
  if (status === 'ENOUGH') return 'green'
  if (status === 'PARTIAL') return 'yellow'
  return 'grey'
}

const resetTest = () => {
  activeRequest?.abort()
  activeRequest = null
  isSending.value = false
  message.value = ''
  state.value = null
}

const scrollToLatestMessage = async () => {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

const sendMessage = async () => {
  if (isSending.value || !message.value.trim()) return
  if (promptSource.value === 'DRAFT' && !draftPrompt.value.trim()) {
    toast.error('새 프롬프트 내용을 입력해주세요.')
    return
  }

  const controller = new AbortController()
  activeRequest = controller
  isSending.value = true
  try {
    const request = createPreviewRequest({
      job: job.value,
      experience: experience.value,
      promptSource: promptSource.value,
      draftPrompt: draftPrompt.value,
      priorState: state.value,
      userMessageId: crypto.randomUUID(),
      message: message.value,
    })
    const response = await promptsApi.previewV2(request, controller.signal)
    if (controller.signal.aborted) return
    const result = response.data.data

    state.value = result.nextState
    message.value = ''
    await scrollToLatestMessage()
  } catch (error: unknown) {
    if (controller.signal.aborted) return
    toast.error(getErrorMessage(error, '회고 테스트 응답을 생성하지 못했습니다.'))
  } finally {
    if (activeRequest === controller) {
      activeRequest = null
      isSending.value = false
    }
  }
}

onUnmounted(() => activeRequest?.abort())
</script>

<template>
  <DashboardLayout>
    <div class="space-y-5">
      <PageHeader
        title="회고 테스트"
        subtitle="V2 회고 대화와 정보 구조화 결과를 운영 데이터 저장 없이 확인합니다."
      >
        <template #actions>
          <BaseButton variant="ghost" size="sm" :disabled="!isStarted && !message" @click="resetTest">
            <RotateCcw class="h-4 w-4" />
            새 테스트
          </BaseButton>
        </template>
      </PageHeader>

      <div class="grid grid-cols-1 items-start gap-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <Card class="space-y-5">
          <div>
            <h3 class="text-body3 font-semibold text-grey-13">테스트 설정</h3>
            <p class="mt-1 text-caption1 text-grey-7">대화를 시작하면 설정이 고정됩니다.</p>
          </div>

          <fieldset :disabled="isConfigurationLocked" class="space-y-5 disabled:opacity-60">
            <div class="space-y-2">
              <label class="text-label1 font-medium text-grey-9">직업</label>
              <SelectField v-model="job" :options="jobOptions" min-width="100%" />
            </div>

            <div class="space-y-2">
              <label class="text-label1 font-medium text-grey-9">경력</label>
              <SelectField v-model="experience" :options="experienceOptions" min-width="100%" />
            </div>

            <div class="space-y-2">
              <p class="text-label1 font-medium text-grey-9">프롬프트</p>
              <div class="grid grid-cols-2 gap-2">
                <BaseButton
                  variant="chip"
                  size="sm"
                  :active="promptSource === 'SAVED'"
                  @click="promptSource = 'SAVED'"
                >
                  저장된 프롬프트
                </BaseButton>
                <BaseButton
                  variant="chip"
                  size="sm"
                  :active="promptSource === 'DRAFT'"
                  @click="promptSource = 'DRAFT'"
                >
                  새 프롬프트
                </BaseButton>
              </div>
            </div>

            <div v-if="promptSource === 'DRAFT'" class="space-y-2">
              <div class="flex items-center justify-between">
                <label for="draft-prompt" class="text-label1 font-medium text-grey-9">프롬프트 내용</label>
                <span class="text-caption2 text-grey-6">{{ formatNumber(draftPrompt.length) }}자</span>
              </div>
              <textarea
                id="draft-prompt"
                v-model="draftPrompt"
                rows="10"
                placeholder="테스트할 V2 회고 프롬프트를 입력하세요."
                class="w-full resize-y rounded-xl border border-grey-5 bg-surface p-3 font-mono text-caption1 leading-relaxed text-grey-13 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-grey-3 disabled:text-grey-7"
              />
            </div>
          </fieldset>
        </Card>

        <Card :padded="false" class="flex min-h-[620px] flex-col overflow-hidden">
          <div class="border-b border-grey-5 px-5 py-4">
            <h3 class="text-body3 font-semibold text-grey-13">V2 회고 대화</h3>
            <p class="mt-0.5 text-caption1 text-grey-7">
              {{ isStarted ? '응답을 이어가며 구조화 결과를 확인하세요.' : '첫 회고 내용을 입력해 테스트를 시작하세요.' }}
            </p>
          </div>

          <div ref="messageList" class="flex-1 space-y-4 overflow-y-auto bg-grey-3/60 p-5">
            <div v-if="!state" class="flex h-full min-h-[380px] items-center justify-center text-center">
              <div>
                <p class="text-body3 font-medium text-grey-9">아직 대화가 없습니다.</p>
                <p class="mt-1 text-caption1 text-grey-7">오늘 있었던 일부터 편하게 입력해보세요.</p>
              </div>
            </div>

            <div
              v-for="item in state?.messages ?? []"
              :key="item.id"
              class="flex"
              :class="item.sender === 'USER' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[82%] rounded-2xl px-4 py-3 text-label1 leading-relaxed"
                :class="item.sender === 'USER'
                  ? 'rounded-br-md bg-primary text-white'
                  : 'rounded-bl-md border border-grey-5 bg-surface text-grey-13'"
              >
                <p class="whitespace-pre-wrap">{{ item.content }}</p>
                <p
                  v-if="item.supportingContent"
                  class="mt-2 whitespace-pre-wrap border-t pt-2 text-caption1"
                  :class="item.sender === 'USER' ? 'border-white/30 text-white/80' : 'border-grey-5 text-grey-7'"
                >
                  {{ item.supportingContent }}
                </p>
              </div>
            </div>

            <div v-if="isSending" class="flex justify-start">
              <div class="rounded-2xl rounded-bl-md border border-grey-5 bg-surface px-4 py-3 text-label1 text-grey-7">
                AI 응답을 생성하고 있습니다…
              </div>
            </div>
          </div>

          <form class="border-t border-grey-5 bg-surface p-4" @submit.prevent="sendMessage">
            <textarea
              v-model="message"
              rows="3"
              :disabled="isSending"
              placeholder="회고 내용을 입력하세요. Shift + Enter로 줄바꿈할 수 있습니다."
              class="w-full resize-none rounded-xl border border-grey-5 bg-surface px-3.5 py-3 text-label1 text-grey-13 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-grey-3"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <div class="mt-3 flex justify-end">
              <BaseButton type="submit" size="sm" :disabled="!canSend" :loading="isSending">
                <Send class="h-4 w-4" />
                보내기
              </BaseButton>
            </div>
          </form>
        </Card>

        <Card class="space-y-4">
          <div>
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-body3 font-semibold text-grey-13">정보 구조화</h3>
              <span class="text-label1 font-semibold text-green-dark">
                {{ progress.filledCount }} / {{ progress.totalCount }}
              </span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-grey-4">
              <div
                class="h-full rounded-full bg-primary transition-all duration-300"
                :style="{ width: `${(progress.filledCount / progress.totalCount) * 100}%` }"
              />
            </div>
          </div>

          <div class="divide-y divide-grey-4">
            <div v-for="item in analysisItems" :key="item.itemType" class="py-3 first:pt-0 last:pb-0">
              <div class="flex items-center justify-between gap-3">
                <p class="text-label1 font-semibold text-grey-13">{{ itemLabels[item.itemType] }}</p>
                <Badge :tone="statusTone(item.status)">{{ statusLabels[item.status] }}</Badge>
              </div>
              <p v-if="item.summary" class="mt-2 whitespace-pre-wrap text-caption1 leading-relaxed text-grey-8">
                {{ item.summary }}
              </p>
              <p v-else class="mt-2 text-caption1 text-grey-6">아직 수집된 정보가 없습니다.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>
