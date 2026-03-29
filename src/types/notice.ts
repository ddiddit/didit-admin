export type NoticeStatus = 'PUBLISHED' | 'DRAFT'

export interface Notice {
    id: string
    title: string
    status: NoticeStatus
    sendPush: boolean
    sendEmail: boolean
    createdAt: string
}

export interface NoticeDetail extends Notice {
    content: string
    updatedAt: string
}

export interface NoticeRequest {
    title: string
    content: string
    status: NoticeStatus
    sendPush: boolean
    sendEmail: boolean
}