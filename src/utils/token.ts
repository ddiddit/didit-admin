const ACCESS_TOKEN_KEY = 'didit_admin_access_token'
const REFRESH_TOKEN_KEY = 'didit_admin_refresh_token'

function decodeJwt(token: string): { sub: string; role: string; position?: string; iat: number; exp: number } | null {
    try {
        return JSON.parse(atob(token.split('.')[1]))
    } catch {
        return null
    }
}

// 만료 임박 토큰을 미리 만료로 간주하기 위한 여유 시간(초)
const EXPIRY_LEEWAY_SECONDS = 10

function isTokenValid(token: string | null): boolean {
    if (!token) return false
    const payload = decodeJwt(token)
    // JWT가 아닌 불투명 토큰은 만료를 알 수 없으므로 서버 판단에 맡긴다
    if (!payload || typeof payload.exp !== 'number') return true
    return payload.exp - EXPIRY_LEEWAY_SECONDS > Date.now() / 1000
}

export const tokenStorage = {
    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY)
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY)
    },

    setTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    },

    clearTokens() {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
    },

    getRole(): string | null {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY)
        if (!token) return null
        return decodeJwt(token)?.role ?? null
    },

    getPosition(): string | null {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY)
        if (!token) return null
        return decodeJwt(token)?.position ?? null
    },

    isSuperAdmin(): boolean {
        return this.getRole() === 'SUPER_ADMIN'
    },

    isAccessTokenValid(): boolean {
        return isTokenValid(this.getAccessToken())
    },

    isRefreshTokenValid(): boolean {
        return isTokenValid(this.getRefreshToken())
    },

    // 유효한 액세스 토큰이 있거나, 재발급에 쓸 유효한 리프레시 토큰이 있으면 인증된 것으로 본다
    isAuthenticated(): boolean {
        return this.isAccessTokenValid() || this.isRefreshTokenValid()
    },
}