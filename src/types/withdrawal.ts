export interface WithdrawalReasonCount {
  reason: string
  count: number
  percentage: number
}

export interface WithdrawalStats {
  total: number
  breakdown: WithdrawalReasonCount[]
}
