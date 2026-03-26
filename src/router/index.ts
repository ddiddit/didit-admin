import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/auth/LoginPage.vue'
import NoticesPage from '@/views/notices/NoticesPage.vue'
import InquiriesPage from '@/views/inquiries/InquiriesPage.vue'
import ManagersPage from '@/views/managers/ManagersPage.vue'
import RegisterPage from '@/views/register/RegisterPage.vue'
import { tokenStorage } from '@/utils/token'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
        },
        {
            path: '/register',
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
            path: '/managers',
            name: 'managers',
            component: ManagersPage,
            meta: { requiresAuth: true, requiresSuperAdmin: true },
        },
    ],
})

router.beforeEach((to, _from, next) => {
    const token = tokenStorage.getAccessToken()

    if (to.meta.requiresAuth && !token) {
        next('/login')
        return
    }

    if (to.meta.requiresSuperAdmin && !tokenStorage.isSuperAdmin()) {
        next('/notices')
        return
    }

    if (to.path === '/login' && token) {
        next('/notices')
        return
    }

    next()
})

export default router