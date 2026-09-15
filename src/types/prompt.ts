export type PromptJobType = 'DEVELOPER' | 'PLANNER' | 'DESIGNER'
export type PromptType = 'DEEP_QUESTION' | 'SUMMARY' | 'CONVERSATION_V2' | 'RESULT_V2'

export interface Prompt {
  id: string
  jobType: PromptJobType
  promptType: PromptType
  content: string
  updatedAt: string
  updatedBy: string | null
}
