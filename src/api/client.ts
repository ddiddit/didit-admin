import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/utils/token'
import type { ApiResponse, ProblemDetail } from '@/types/api'
import type { AuthTokenResponse } from '@/types/auth'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

const client = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin`,
    headers: {
        'Content-Type': 'application/json',
    },
})

client.interceptors.request.use((config) => {
    const accessToken = tokenStorage.getAccessToken()
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ProblemDetail>) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined

        if (!originalRequest || originalRequest._retry) {
            return Promise.reject(error)
        }

        if (error.response?.status !== 401) {
            return Promise.reject(error)
        }

        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) {
            tokenStorage.clearTokens()
            window.location.href = '/login'
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            const response = await axios.post<ApiResponse<AuthTokenResponse>>(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } },
            )

            const { accessToken, refreshToken: newRefreshToken } = response.data.data
            tokenStorage.setTokens(accessToken, newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`

            return client(originalRequest)
        } catch (refreshError) {
            tokenStorage.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
        }
    },
)

export default client