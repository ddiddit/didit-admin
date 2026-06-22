// AI 토큰 단가 — 백엔드는 토큰 사용량만 내려주고, 비용(원)은 프론트에서 이 단가로 환산한다.
// HyperCLOVA X HCX-005 기본 단가 (1,000 토큰당 원). 단가가 바뀌면 이 값만 수정하면 된다.
// TODO(백엔드): 추후 단가를 서버 설정으로 내려주면 이 상수 대신 그 값을 사용.
export const TOKEN_PRICE = {
  inputPer1K: 1.25, // HCX-005 입력
  outputPer1K: 5, // HCX-005 출력
} as const

/** 입력·출력 토큰을 원화 예상 비용으로 환산 */
export const estimateTokenCost = (inputTokens: number, outputTokens: number): number =>
  (inputTokens / 1000) * TOKEN_PRICE.inputPer1K + (outputTokens / 1000) * TOKEN_PRICE.outputPer1K

/** 원화 포맷 (반올림·천 단위 구분) — 예: 1,003원 */
export const formatWon = (won: number): string => `${Math.round(won).toLocaleString()}원`
