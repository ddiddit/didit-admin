const ACCESS_TOKEN_KEY = 'didit_admin_access_token'
const REFRESH_TOKEN_KEY = 'didit_admin_refresh_token'

function decodeJwt(token: string): { sub: string; role: string; position?: string; iat: number; exp: number } | null {
    try {
        return JSON.parse(atob(token.split('.')[1]))
    } catch {
        return null
    }
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
}