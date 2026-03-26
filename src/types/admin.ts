export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'
export type AdminPosition = 'PLANNER' | 'DESIGNER' | 'DEVELOPER'
export type AdminStatus = 'PENDING' | 'ACTIVE' | 'REJECTED'

export interface Admin {
    id: string
    email: string
    role: AdminRole
    position?: AdminPosition
    status: AdminStatus
}

export interface InviteRequest {
    email: string
    position: AdminPosition
}