import client from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { Inquiry, InquiryDetail, InquiryAnswerRequest } from '@/types/inquiry'

export const inquiriesApi = {
    list() {
        return client.get<ApiResponse<Inquiry[]>>('/inquiries')
    },

    get(inquiryId: string) {
        return client.get<ApiResponse<InquiryDetail>>(`/inquiries/${inquiryId}`)
    },

    answer(inquiryId: string, payload: InquiryAnswerRequest) {
        return client.post<ApiResponse<InquiryDetail>>(`/inquiries/${inquiryId}/answer`, payload)
    },

    updateAnswer(inquiryId: string, payload: InquiryAnswerRequest) {
        return client.patch<ApiResponse<InquiryDetail>>(`/inquiries/${inquiryId}/answer`, payload) // PATCH
    },

    delete(inquiryId: string) {
        return client.delete(`/inquiries/${inquiryId}`)
    },
}