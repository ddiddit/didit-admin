export interface LevelStat {
  level: number
  userCount: number
}

export interface MissionStat {
  level: number
  inProgress: number
  completed: number
  failed: number
  total: number
  completionRate: number
}

export interface BadgeStat {
  badgeId: string
  name: string
  category: string
  conditionType: string
  active: boolean
  acquiredCount: number
}
