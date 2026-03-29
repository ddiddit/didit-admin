import client from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { Notice, NoticeDetail, NoticeRequest } from '@/types/notice'

export const noticesApi = {
    list() {
        return client.get<ApiResponse<Notice[]>>('/notices')
    },

    get(noticeId: string) {
        return client.get<ApiResponse<NoticeDetail>>(`/notices/${noticeId}`)
    },

    create(payload: NoticeRequest) {
        return client.post<ApiResponse<NoticeDetail>>('/notices', payload)
    },

    update(noticeId: string, payload: NoticeRequest) {
        return client.put<ApiResponse<NoticeDetail>>(`/notices/${noticeId}`, payload)
    },

    delete(noticeId: string) {
        return client.delete(`/notices/${noticeId}`)
    },
}