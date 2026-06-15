import client from './client'
import type { ApiResponse } from '@/types/api'
import type { UserDetail, UserPage } from '@/types/user'

interface UserListParams {
  keyword?: string
  job?: string
  isDeleted?: boolean
  page?: number
}

export const usersApi = {
  list(params: UserListParams = {}) {
    return client.get<ApiResponse<UserPage>>('/api/v1/admin/users', { params })
  },

  get(userId: string) {
    return client.get<ApiResponse<UserDetail>>(`/api/v1/admin/users/${userId}`)
  },

  forceWithdraw(userId: string) {
    return client.post<void>(`/api/v1/admin/users/${userId}/force-withdraw`)
  },
}
