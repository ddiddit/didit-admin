export interface DailyRetroCount {
  date: string
  count: number
}

export interface RetrospectiveStats {
  total: number
  completed: number
  inProgress: number
  completionRate: number
  avgPerUser: number
  textAnswerCount: number
  voiceAnswerCount: number
  dailyTrend: DailyRetroCount[]
}
