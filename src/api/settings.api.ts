import client from '@/api/client'
import publicClient from '@/api/publicClient'
import type { ApiResponse } from '@/types/api'

export interface AppConfig {
    maintenanceMode: boolean
    maintenanceMessage: string | null
    minimumVersion: string
}

export const settingsApi = {
    getAppConfig: () =>
        publicClient.get<ApiResponse<AppConfig>>('/app/config').then(r => r.data.data),

    updateAppConfig: (data: AppConfig) =>
        client.put<ApiResponse<AppConfig>>('/settings/app-config', data).then(r => r.data.data),
}