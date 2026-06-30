import client from './client'
import type { ApiResponse } from '@/types/api'
import type { Badge, BadgeHolder, BadgeConditionMeta, BadgeRequest } from '@/types/badge'

export const badgesApi = {
  list() {
    return client.get<ApiResponse<Badge[]>>('/badges')
  },

  conditionTypes() {
    return client.get<ApiResponse<BadgeConditionMeta>>('/badges/condition-types')
  },

  get(badgeId: string) {
    return client.get<ApiResponse<Badge>>(`/badges/${badgeId}`)
  },

  holders(badgeId: string) {
    return client.get<ApiResponse<BadgeHolder[]>>(`/badges/${badgeId}/holders`)
  },

  create(payload: BadgeRequest) {
    return client.post<ApiResponse<Badge>>('/badges', payload)
  },

  update(badgeId: string, payload: BadgeRequest) {
    return client.put<ApiResponse<Badge>>(`/badges/${badgeId}`, payload)
  },

  changeActive(badgeId: string, active: boolean) {
    return client.patch<ApiResponse<Badge>>(`/badges/${badgeId}/active`, { active })
  },
}
