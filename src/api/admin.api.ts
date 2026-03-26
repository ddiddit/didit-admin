import client from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { Admin, InviteRequest } from '@/types/admin'

export const adminApi = {
    list() {
        return client.get<ApiResponse<Admin[]>>('')
    },

    invite(payload: InviteRequest) {
        return client.post('/invite', payload)
    },

    approve(adminId: string) {
        return client.post(`/${adminId}/approve`)
    },

    reject(adminId: string) {
        return client.post(`/${adminId}/reject`)
    },

    delete(adminId: string) {
        return client.delete(`/${adminId}`)
    },

    register(token: string, payload: { email: string; password: string }) {
        return client.post(`/register?token=${token}`, payload)
    },
}