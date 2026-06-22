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
  todayCompletionRate: number // 오늘 완료율(%)
  totalInputTokens: number
  totalOutputTokens: number
  todayInputTokens: number // 오늘(완료일 기준) 입력 토큰
  todayOutputTokens: number // 오늘(완료일 기준) 출력 토큰
  monthInputTokens: number // 이번달(완료일 기준) 입력 토큰
  monthOutputTokens: number // 이번달(완료일 기준) 출력 토큰
  textAnswerCount: number
  voiceAnswerCount: number
  recentUsers: RecentUser[]
  recentInquiries: RecentInquiry[]
}
