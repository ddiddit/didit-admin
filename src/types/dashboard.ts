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

export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalRetrospects: number
  unansweredInquiries: number
  recentUsers: RecentUser[]
  recentInquiries: RecentInquiry[]
}
