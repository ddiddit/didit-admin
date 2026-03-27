<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { settingsApi } from '@/api/settings.api'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import type { ProblemDetail } from '@/types/api'

const maintenanceMode = ref(false)
const maintenanceMessage = ref('')
const minimumVersion = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const data = await settingsApi.getAppConfig()
    maintenanceMode.value = data.maintenanceMode
    maintenanceMessage.value = data.maintenanceMessage ?? ''
    minimumVersion.value = data.minimumVersion
  } catch {
    toast.error('설정을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
})

const handleSave = async () => {
  isSaving.value = true
  try {
    await settingsApi.updateAppConfig({
      maintenanceMode: maintenanceMode.value,
      maintenanceMessage: maintenanceMessage.value || null,
      minimumVersion: minimumVersion.value,
    })
    toast.success('저장되었습니다.')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSaving" />

    <div class="flex min-h-full justify-center pt-10">
      <div class="w-full max-w-2xl space-y-5">

        <!-- 헤더 -->
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">앱 설정</h2>
          <p class="mt-0.5 text-sm text-neutral-400">점검 모드 및 강제 업데이트를 관리합니다.</p>
        </div>

        <!-- 점검 모드 -->
        <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
          <h3 class="text-sm font-semibold text-neutral-900">점검 모드</h3>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-600">점검 모드 활성화</p>
              <p class="text-xs text-neutral-400 mt-0.5">활성화 시 모든 앱 사용자에게 점검 화면이 표시됩니다.</p>
            </div>
            <button
                type="button"
                @click="maintenanceMode = !maintenanceMode"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer',
                  maintenanceMode ? 'bg-primary' : 'bg-neutral-200'
                ]"
            >
              <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  ]"
              />
            </button>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">점검 메시지</label>
            <input
                v-model="maintenanceMessage"
                type="text"
                placeholder="점검 중입니다. 잠시 후 다시 시도해주세요."
                :disabled="!maintenanceMode"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- 강제 업데이트 -->
        <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
          <h3 class="text-sm font-semibold text-neutral-900">강제 업데이트</h3>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">최소 지원 버전</label>
            <input
                v-model="minimumVersion"
                type="text"
                placeholder="1.0.0"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p class="mt-1.5 text-xs text-neutral-400">이 버전 미만의 앱은 강제 업데이트 팝업이 표시됩니다.</p>
          </div>
        </div>

        <!-- 저장 버튼 -->
        <BaseButton type="button" :disabled="isSaving" @click="handleSave">
          {{ isSaving ? '저장 중' : '저장' }}
        </BaseButton>

      </div>
    </div>

  </DashboardLayout>
</template>