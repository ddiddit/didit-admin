import client from './client'
import type { RetrospectiveStats } from '@/types/retrospectiveStats'
import type { ApiResponse } from '@/types/api'

export const retrospectiveStatsApi = {
  getStats: () => client.get<ApiResponse<RetrospectiveStats>>('/retrospective-stats'),
}
