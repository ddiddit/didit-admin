import client from './client'
import type { ApiResponse } from '@/types/api'
import type { Badge, BadgeHolder } from '@/types/badge'

export const badgesApi = {
  list() {
    return client.get<ApiResponse<Badge[]>>('/badges')
  },

  holders(badgeId: string) {
    return client.get<ApiResponse<BadgeHolder[]>>(`/badges/${badgeId}/holders`)
  },
}
