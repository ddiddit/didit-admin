import client from './client'
import type { AuditLogsPage, AuditActionOption } from '@/types/auditLog'
import type { ApiResponse } from '@/types/api'

export const auditLogApi = {
  list: (params?: { action?: string; actorType?: string; page?: number }) =>
    client.get<ApiResponse<AuditLogsPage>>('/audit-logs', { params }),
  // 전체 액션 목록(라벨·유형 포함) — 액션 필터 드롭다운 구성용
  actions: () => client.get<ApiResponse<AuditActionOption[]>>('/audit-logs/actions'),
}
