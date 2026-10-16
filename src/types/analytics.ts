export interface AdminAnalytics {
  from: string
  to: string
  retrospectiveCount: number
  completedCount: number
  completionRate: number
  retentionEligibleCount: number
  retentionReturnedCount: number
  retentionObservingCount: number
  secondCompletionRateWithin14Days: number
  returningUserCount: number
  newUserCount: number
  averageAnswerCount: number | null
  medianAnswerCount: number | null
  averageElapsedDurationSeconds: number | null
  medianElapsedDurationSeconds: number | null
}
