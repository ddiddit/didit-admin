import client from './client'
import type { ApiResponse } from '@/types/api'
import type { DashboardStats } from '@/types/dashboard'

export const dashboardApi = {
  getStats() {
    return client.get<ApiResponse<DashboardStats>>('/stats')
  },
}
