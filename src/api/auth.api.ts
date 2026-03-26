import client from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { AuthTokenResponse, LoginRequest } from '@/types/auth'

export const authApi = {
    login(payload: LoginRequest) {
        return client.post<ApiResponse<AuthTokenResponse>>('/auth/login', payload)
    },

    refresh(refreshToken: string) {
        return client.post<ApiResponse<AuthTokenResponse>>('/auth/refresh', { refreshToken })
    },

    logout() {
        return client.post('/auth/logout')
    },
}