export interface AuditLogItem {
  action: string
  actionLabel: string
  actorId: string | null
  actorType: string | null
  targetId: string | null
  targetType: string | null
  payload: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogsPage {
  content: AuditLogItem[]
  totalElements: number
  totalPages: number
  page: number
}

export interface AuditActionOption {
  action: string
  label: string
  actorType: 'USER' | 'ADMIN' | 'SYSTEM'
}
