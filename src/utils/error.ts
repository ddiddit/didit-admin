// API 에러에서 사용자에게 보여줄 메시지를 추출한다.
import type { ProblemDetail } from '@/types/api'

/**
 * axios 에러 등에서 ProblemDetail.detail 메시지를 꺼낸다.
 * 추출에 실패하면 fallback 문구를 반환한다.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  const problem = (error as { response?: { data?: ProblemDetail } })?.response?.data
  return problem?.detail || fallback
}
