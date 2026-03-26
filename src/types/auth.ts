export interface LoginRequest {
    email: string
    password: string
}

export interface TokenRefreshRequest {
    refreshToken: string
}

export interface AuthTokenResponse {
    accessToken: string
    refreshToken: string
}