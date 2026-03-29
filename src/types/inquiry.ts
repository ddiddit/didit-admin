export type InquiryStatus = 'PENDING' | 'ANSWERED'
export type InquiryType = 'USAGE' | 'BUG' | 'IMPROVEMENT' | 'ETC'

// 목록 조회용
export interface Inquiry {
    id: string
    email: string
    type: InquiryType
    content: string
    status: InquiryStatus
    createdAt: string
}

// 상세 조회용
export interface InquiryDetail extends Inquiry {
    typeEtc: string
    adminAnswer: string | null
    answeredAt: string | null
}

export interface InquiryAnswerRequest {
    answer: string
}