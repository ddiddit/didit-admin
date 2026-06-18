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

// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 수행하고, 나머지는 그 결과를 기다린다.
// (각자 재발급하면 회전된 refresh token 탓에 뒤따르는 요청들이 무효 토큰으로 실패해 강제 로그아웃됨)
let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

function onRefreshResolved(token: string | null) {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
}

function redirectToLogin() {
    tokenStorage.clearTokens()
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'
    }
}

client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ProblemDetail>) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined

        if (!originalRequest || originalRequest._retry) {
            return Promise.reject(error)
        }

        // 백엔드가 만료된 토큰에 401 대신 403을 반환하는 경우도 재발급 시도
        const status = error.response?.status
        if (status !== 401 && status !== 403) {
            return Promise.reject(error)
        }

        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) {
            redirectToLogin()
            return Promise.reject(error)
        }

        originalRequest._retry = true

        // 이미 재발급이 진행 중이면 새 토큰을 기다렸다가 원래 요청을 재시도한다
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshSubscribers.push((token) => {
                    if (!token) {
                        reject(error)
                        return
                    }
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    resolve(client(originalRequest))
                })
            })
        }

        isRefreshing = true

        try {
            const response = await axios.post<ApiResponse<AuthTokenResponse>>(
                `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } },
            )

            const { accessToken, refreshToken: newRefreshToken } = response.data.data
            tokenStorage.setTokens(accessToken, newRefreshToken)
            onRefreshResolved(accessToken)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`

            return client(originalRequest)
        } catch (refreshError) {
            onRefreshResolved(null)
            redirectToLogin()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    },
)

export default client