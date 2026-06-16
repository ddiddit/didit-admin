import client from './client'
import type { AuditLogsPage } from '@/types/auditLog'
import type { ApiResponse } from '@/types/api'

export const auditLogApi = {
  list: (params?: { action?: string; actorType?: string; page?: number }) =>
    client.get<ApiResponse<AuditLogsPage>>('/audit-logs', { params }),
}
