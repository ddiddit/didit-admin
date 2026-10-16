import client from './client'
import type { ApiResponse } from '@/types/api'
import type { UserAccountType, UserDetail, UserPage } from '@/types/user'

interface UserListParams {
  keyword?: string
  job?: string
  isDeleted?: boolean
  page?: number
}

export const usersApi = {
  list(params: UserListParams = {}) {
    return client.get<ApiResponse<UserPage>>('/users', { params })
  },

  get(userId: string) {
    return client.get<ApiResponse<UserDetail>>(`/users/${userId}`)
  },

  forceWithdraw(userId: string) {
    return client.post<void>(`/users/${userId}/force-withdraw`)
  },

  changeAccountType(userId: string, accountType: UserAccountType) {
    return client.patch<void>(`/users/${userId}/account-type`, { accountType })
  },
}
