import client from '@/api/client'

export type NoticeEmailTargetType = 'ALL' | 'SELECTED_USERS'

export interface NoticeEmailSendRequest {
    targetType: NoticeEmailTargetType
    userIds: string[]
    subject: string
    body: string
}

export const notificationsApi = {
    // 공지 이메일 발송 (SUPER_ADMIN 전용) - 204 No Content
    sendNoticeEmail(payload: NoticeEmailSendRequest) {
        return client.post('/notice-emails', payload)
    },
}
