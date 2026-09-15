import type { PromptJobType, PromptType } from '@/types/prompt'

const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  DEEP_QUESTION: '심화 질문 (V1)',
  SUMMARY: '회고 요약 (V1)',
  CONVERSATION_V2: '회고 대화 (V2)',
  RESULT_V2: '정보 구조화 (V2)',
}

export const getPromptTypeLabel = (promptType: PromptType) => PROMPT_TYPE_LABELS[promptType]

const JOB_ORDER: Record<PromptJobType, number> = {
  DEVELOPER: 0,
  PLANNER: 1,
  DESIGNER: 2,
}

const TYPE_ORDER: Record<PromptType, number> = {
  DEEP_QUESTION: 0,
  SUMMARY: 1,
  CONVERSATION_V2: 2,
  RESULT_V2: 3,
}

export const getPromptOrder = (jobType: PromptJobType, promptType: PromptType) =>
  JOB_ORDER[jobType] * Object.keys(TYPE_ORDER).length + TYPE_ORDER[promptType]
