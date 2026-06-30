import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import LoginPage from '@/views/auth/LoginPage.vue'
import DashboardPage from '@/views/dashboard/DashboardPage.vue'
import NoticesPage from '@/views/notices/NoticesPage.vue'
import InquiriesPage from '@/views/inquiries/InquiriesPage.vue'
import InquiryDetailPage from '@/views/inquiries/InquiryDetailPage.vue'
import ManagersPage from '@/views/managers/ManagersPage.vue'
import RegisterPage from '@/views/register/RegistersPage.vue'
import SettingsPage from '@/views/settings/SettingsPage.vue'
import NotificationsPage from '@/views/notifications/NotificationsPage.vue'
import UsersPage from '@/views/users/UsersPage.vue'
import UserDetailPage from '@/views/users/UserDetailPage.vue'
import BadgesPage from '@/views/badges/BadgesPage.vue'
import PromptsPage from '@/views/prompts/PromptsPage.vue'
import PromptEditPage from '@/views/prompts/PromptEditPage.vue'
import WithdrawalStatsPage from '@/views/withdrawal/WithdrawalStatsPage.vue'
import RetrospectiveStatsPage from '@/views/retrospective/RetrospectiveStatsPage.vue'
import AchievementStatsPage from '@/views/stats/AchievementStatsPage.vue'
import AuditLogsPage from '@/views/audit/AuditLogsPage.vue'

import { tokenStorage } from '@/utils/token'
import type { ApiResponse } from '@/types/api'
import type { AuthTokenResponse } from '@/types/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/dashboard',
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
        },
        {
            path: '/admin/register',
            name: 'register',
            component: RegisterPage,
        },
        {
            path: '/notices',
            name: 'notices',
            component: NoticesPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/inquiries',
            name: 'inquiries',
            component: InquiriesPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/inquiries/:id',
            name: 'inquiry-detail',
            component: InquiryDetailPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/managers',
            name: 'managers',
            component: ManagersPage,
            meta: { requiresAuth: true, requiresSuperAdmin: true },
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/notifications',
            name: 'notifications',
            component: NotificationsPage,
            meta: { requiresAuth: true, requiresSuperAdmin: true },
        },
        {
            path: '/users',
            name: 'users',
            component: UsersPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/users/:id',
            name: 'user-detail',
            component: UserDetailPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/badges',
            name: 'badges',
            component: BadgesPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/prompts',
            name: 'prompts',
            component: PromptsPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/prompts/:id',
            name: 'prompt-edit',
            component: PromptEditPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/withdrawal-stats',
            name: 'withdrawal-stats',
            component: WithdrawalStatsPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/retrospective-stats',
            name: 'retrospective-stats',
            component: RetrospectiveStatsPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/stats/achievements',
            name: 'achievement-stats',
            component: AchievementStatsPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/audit-logs',
            name: 'audit-logs',
            component: AuditLogsPage,
            meta: { requiresAuth: true },
        },
    ],
})

// access token 만료 시 refresh token으로 조용히 재발급 시도
async function trySilentRefresh(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return
    try {
        const { data } = await axios.post<ApiResponse<AuthTokenResponse>>(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
        )
        tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken)
    } catch {
        // 재발급 실패 → 토큰 모두 제거해 다음 가드에서 로그인으로 보냄
        tokenStorage.clearTokens()
    }
}

router.beforeEach(async (to, _from, next) => {
    // access token이 만료됐고 refresh token이 남아있으면 재발급 먼저 시도
    if (!tokenStorage.isAccessTokenValid() && tokenStorage.getRefreshToken()) {
        await trySilentRefresh()
    }

    // 재발급 결과를 반영해 access token 유효 여부를 최종 판단
    const isAuthenticated = tokenStorage.isAccessTokenValid()

    if (to.meta.requiresAuth && !isAuthenticated) {
        tokenStorage.clearTokens()
        next('/login')
        return
    }

    if (to.meta.requiresSuperAdmin && !tokenStorage.isSuperAdmin()) {
        next('/dashboard')
        return
    }

    if (to.path === '/login' && isAuthenticated) {
        next('/dashboard')
        return
    }

    next()
})

export default router
