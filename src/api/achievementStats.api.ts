import client from './client'
import type { ApiResponse } from '@/types/api'
import type { LevelStat, MissionStat, BadgeStat } from '@/types/achievementStats'

export const achievementStatsApi = {
  levels() {
    return client.get<ApiResponse<LevelStat[]>>('/stats/levels')
  },

  missions() {
    return client.get<ApiResponse<MissionStat[]>>('/stats/missions')
  },

  badges() {
    return client.get<ApiResponse<BadgeStat[]>>('/stats/badges')
  },
}
