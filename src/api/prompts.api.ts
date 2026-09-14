import client from './client'
import type { ApiResponse } from '@/types/api'
import type { Prompt } from '@/types/prompt'
import type {
  RetrospectiveTestRequest,
  RetrospectiveTestResult,
} from '@/types/retrospectiveTest'
import { createPreviewRequestConfig } from '@/utils/retrospectiveTest'

export const promptsApi = {
  list() {
    return client.get<ApiResponse<Prompt[]>>('/prompts')
  },

  get(id: string) {
    return client.get<ApiResponse<Prompt>>(`/prompts/${id}`)
  },

  update(id: string, content: string) {
    return client.put<ApiResponse<Prompt>>(`/prompts/${id}`, { content })
  },

  previewV2(request: RetrospectiveTestRequest, signal?: AbortSignal) {
    return client.post<ApiResponse<RetrospectiveTestResult>>(
      '/prompts/preview-v2',
      request,
      createPreviewRequestConfig(signal),
    )
  },
}
