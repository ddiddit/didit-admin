import client from './client'
import type { WithdrawalStats } from '@/types/withdrawal'
import type { ApiResponse } from '@/types/api'

export const withdrawalApi = {
  getStats: () => client.get<ApiResponse<WithdrawalStats>>('/withdrawal-stats'),
}
