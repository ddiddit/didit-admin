export interface RecentUser {
  id: string
  email: string | null
  nickname: string | null
  job: string | null
  createdAt: string | null
}

export interface RecentInquiry {
  id: string
  type: string
  content: string
  status: string
  createdAt: string | null
}

export interface DailyRetroCount {
  date: string
  count: number
}

export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalRetrospects: number
  unansweredInquiries: number
  dau: number
  todayRetrospects: number
  weeklyRetroTrend: DailyRetroCount[]
  totalInputTokens: number
  totalOutputTokens: number
  textAnswerCount: number
  voiceAnswerCount: number
  recentUsers: RecentUser[]
  recentInquiries: RecentInquiry[]
}
