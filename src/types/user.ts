export type UserJob = 'DEVELOPER' | 'PLANNER' | 'DESIGNER'
export type UserAge = 'AGE_20' | 'AGE_30' | 'AGE_40_PLUS'
export type UserExperience = 'LESS_THAN_1_YEAR' | 'YEARS_1_TO_2' | 'YEARS_3_TO_5' | 'YEARS_6_TO_9' | 'YEARS_10_PLUS'

export interface UserSummary {
  id: string
  email: string | null
  nickname: string | null
  job: UserJob | null
  age: UserAge | null
  experience: UserExperience | null
  provider: string
  createdAt: string | null
  lastLoginAt: string | null
  onboardingCompleted: boolean
  deleted: boolean
}

export interface ActivityLog {
  action: string
  payload: Record<string, unknown> | null
  createdAt: string
}

export interface UserDetail {
  profile: UserSummary
  timeline: ActivityLog[]
}

export interface UserPage {
  content: UserSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
