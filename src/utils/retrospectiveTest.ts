import type {
  RetrospectiveAnalysisItem,
  RetrospectiveTestRequest,
  RetrospectiveTestState,
} from '@/types/retrospectiveTest'
import { RETROSPECTIVE_ITEM_TYPES } from '../types/retrospectiveTest.ts'

const PREVIEW_TIMEOUT_MS = 120_000

export function createEmptyAnalysisItems(): RetrospectiveAnalysisItem[] {
  return RETROSPECTIVE_ITEM_TYPES.map((itemType) => ({
    itemType,
    status: 'EMPTY',
    summary: null,
  }))
}

export function createPreviewRequest(
  input: RetrospectiveTestRequest,
): RetrospectiveTestRequest {
  return {
    ...input,
    draftPrompt: input.promptSource === 'DRAFT' ? input.draftPrompt?.trim() ?? '' : null,
    message: input.message.trim(),
  }
}

export function createPreviewRequestConfig(signal?: AbortSignal) {
  return {
    signal,
    timeout: PREVIEW_TIMEOUT_MS,
  }
}

export function isTestConfigurationLocked(
  state: RetrospectiveTestState | null,
  isSending: boolean,
): boolean {
  return state !== null || isSending
}
