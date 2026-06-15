import client from './client'
import type { ApiResponse } from '@/types/api'
import type { Prompt } from '@/types/prompt'

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
}
