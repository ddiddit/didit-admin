export interface Badge {
  id: string
  name: string
  description: string
  conditionType: string
  acquiredCount: number
  createdAt: string | null
}

export interface BadgeHolder {
  userId: string
  email: string | null
  nickname: string | null
  acquiredAt: string
}
