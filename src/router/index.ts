import { createRouter, createWebHistory } from 'vue-router'
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

import { tokenStorage } from '@/utils/token'

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
            meta: { requiresAuth: true, requiresSuperAdmin: true },
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
            meta: { requiresAuth: true, requiresSuperAdmin: true },
        },
        {
            path: '/prompts/:id',
            name: 'prompt-edit',
            component: PromptEditPage,
            meta: { requiresAuth: true, requiresSuperAdmin: true },
        },
    ],
})

router.beforeEach((to, _from, next) => {
    const isAuthenticated = tokenStorage.isAuthenticated()

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 만료/잔존 토큰을 정리해 다음 진입에서 다시 튕기지 않도록 한다
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