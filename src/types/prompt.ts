export type PromptJobType = 'DEVELOPER' | 'PLANNER' | 'DESIGNER'
export type PromptType = 'DEEP_QUESTION' | 'SUMMARY'

export interface Prompt {
  id: string
  jobType: PromptJobType
  promptType: PromptType
  content: string
  updatedAt: string
  updatedBy: string | null
}
