<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { settingsApi } from '@/api/settings.api'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Card from '@/components/common/Card.vue'
import { getErrorMessage } from '@/utils/error'

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
    toast.error(getErrorMessage(error, '저장에 실패했습니다.'))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSaving" />

    <div class="mx-auto w-full max-w-2xl space-y-5 pt-2">
      <PageHeader title="앱 설정" subtitle="점검 모드 및 강제 업데이트를 관리합니다." />

      <!-- 점검 모드 -->
      <Card class="space-y-4">
        <h3 class="text-label1 font-semibold text-grey-13">점검 모드</h3>
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-label1 text-grey-9">점검 모드 활성화</p>
            <p class="mt-0.5 text-caption1 text-grey-7">활성화 시 모든 앱 사용자에게 점검 화면이 표시됩니다.</p>
          </div>
          <button
            type="button"
            @click="maintenanceMode = !maintenanceMode"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer',
              maintenanceMode ? 'bg-primary' : 'bg-grey-5'
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
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">점검 메시지</label>
          <input
            v-model="maintenanceMessage"
            type="text"
            placeholder="점검 중입니다. 잠시 후 다시 시도해주세요."
            :disabled="!maintenanceMode"
            class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </Card>

      <!-- 강제 업데이트 -->
      <Card class="space-y-4">
        <h3 class="text-label1 font-semibold text-grey-13">강제 업데이트</h3>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">최소 지원 버전</label>
          <input
            v-model="minimumVersion"
            type="text"
            placeholder="1.0.0"
            class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 text-grey-13 placeholder:text-grey-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p class="mt-1.5 text-caption1 text-grey-7">이 버전 미만의 앱은 강제 업데이트 팝업이 표시됩니다.</p>
        </div>
      </Card>

      <BaseButton variant="primary" size="lg" block :loading="isSaving" @click="handleSave">
        {{ isSaving ? '저장 중' : '저장' }}
      </BaseButton>
    </div>
  </DashboardLayout>
</template>
