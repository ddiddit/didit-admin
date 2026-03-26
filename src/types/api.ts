export interface ApiResponse<T> {
    data: T
}

export interface ProblemDetail {
    type: string
    title: string
    status: number
    detail: string
    instance: string
    properties?: {
        code?: string
        timestamp?: string
        [key: string]: unknown
    }
}