import type { PromptJobType } from './prompt'

export type UserExperience =
  | 'LESS_THAN_1_YEAR'
  | 'YEARS_1_TO_2'
  | 'YEARS_3_TO_5'
  | 'YEARS_6_TO_9'
  | 'YEARS_10_PLUS'

export type PromptSource = 'SAVED' | 'DRAFT'
export type MessageSender = 'USER' | 'AI'
export type ConversationMessageType = 'INTRO' | 'CONVERSATION' | 'SYSTEM_GUIDE'
export const MESSAGE_RELEVANCES = [
  'RETROSPECTIVE',
  'BRIDGEABLE',
  'OFF_TOPIC',
  'SERVICE_HELP',
] as const
export type MessageRelevance = (typeof MESSAGE_RELEVANCES)[number]
export type RetrospectiveItemStatus = 'EMPTY' | 'PARTIAL' | 'ENOUGH'
export const RETROSPECTIVE_ITEM_TYPES = [
  'FACT',
  'FEEL',
  'STRENGTH',
  'BLOCK',
  'PROCESS',
  'LEARN',
  'ACTION',
] as const
export type RetrospectiveItemType = (typeof RETROSPECTIVE_ITEM_TYPES)[number]

export interface RetrospectiveTestMessage {
  id: string
  sender: MessageSender
  content: string
  messageType: ConversationMessageType
  supportingContent: string | null
  relevance: MessageRelevance | null
}

export interface RetrospectiveAnalysisItem {
  itemType: RetrospectiveItemType
  status: RetrospectiveItemStatus
  summary: string | null
}

export interface RetrospectiveTestState {
  messages: RetrospectiveTestMessage[]
  analysisItems: RetrospectiveAnalysisItem[]
}

export interface RetrospectiveTestRequest {
  job: PromptJobType
  experience: UserExperience
  promptSource: PromptSource
  draftPrompt: string | null
  priorState: RetrospectiveTestState | null
  userMessageId: string
  message: string
}

export interface RetrospectiveTestResult {
  assistantMessage: RetrospectiveTestMessage
  progress: {
    filledCount: number
    totalCount: number
  }
  nextState: RetrospectiveTestState
}
