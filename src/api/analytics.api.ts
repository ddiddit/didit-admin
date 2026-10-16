import client from './client'
import type { ApiResponse } from '@/types/api'
import type { AdminAnalytics } from '@/types/analytics'

export const analyticsApi = {
  get(from: string, to: string) {
    return client.get<ApiResponse<AdminAnalytics>>('/analytics', { params: { from, to } })
  },
}
