export interface Badge {
  id: string
  name: string
  description: string
  category: string
  conditionType: string
  threshold: number
  params: Record<string, unknown> | null
  iconUrl: string | null
  congratsTitle: string | null
  congratsMessage: string | null
  active: boolean
  acquiredCount: number
  createdAt: string | null
}

export interface BadgeHolder {
  userId: string
  email: string | null
  nickname: string | null
  acquiredAt: string
}

export interface BadgeRequest {
  name: string
  description: string
  category: string
  conditionType: string
  threshold: number
  params?: Record<string, unknown>
  iconUrl?: string
  congratsTitle?: string
  congratsMessage?: string
}

export interface BadgeActiveRequest {
  active: boolean
}

export interface BadgeConditionParam {
  key: string
  label: string
  type: string
  defaultValue: unknown
  required: boolean
}

export interface BadgeConditionType {
  conditionType: string
  label: string
  description: string
  params: BadgeConditionParam[]
}

export interface BadgeCategoryMeta {
  category: string
  label: string
}

export interface BadgeConditionMeta {
  conditionTypes: BadgeConditionType[]
  categories: BadgeCategoryMeta[]
}
