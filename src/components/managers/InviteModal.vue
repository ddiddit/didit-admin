<script setup lang="ts">
import { ref, reactive } from 'vue'
import { toast } from 'vue-sonner'
import { adminApi } from '@/api/admin.api'
import type { AdminPosition } from '@/types/admin'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FilterChips from '@/components/common/FilterChips.vue'
import SelectField from '@/components/common/SelectField.vue'
import { getErrorMessage } from '@/utils/error'

const emit = defineEmits<{
  close: []
  invited: []
}>()

const positions: { value: AdminPosition; label: string }[] = [
  { value: 'PLANNER', label: '기획자' },
  { value: 'DESIGNER', label: '디자이너' },
  { value: 'DEVELOPER', label: '개발자' },
]

// 모바일 셀렉트용 옵션 (placeholder 포함)
const positionSelectOptions = [
  { value: '', label: '직군 선택' },
  { value: 'PLANNER', label: '기획자' },
  { value: 'DESIGNER', label: '디자이너' },
  { value: 'DEVELOPER', label: '개발자' },
]

const form = reactive({
  email: '',
  position: '' as AdminPosition | '',
})

const isLoading = ref(false)

const handleSubmit = async () => {
  if (!form.email || !form.position) return
  isLoading.value = true
  try {
    await adminApi.invite({ email: form.email, position: form.position })
    toast.success('초대 메일을 발송했습니다.')
    emit('invited')
    emit('close')
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '초대에 실패했습니다.'))
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <BaseSpinner :show="isLoading" />
  <BaseModal :show="true" title="관리자 초대" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-1.5 block text-label1 font-medium text-grey-9">이메일</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="초대할 이메일을 입력해주세요"
          class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-label1 font-medium text-grey-9">직군</label>
        <!-- 모바일: 셀렉트 -->
        <div class="md:hidden">
          <SelectField
            :model-value="form.position"
            :options="positionSelectOptions"
            @update:model-value="(v) => (form.position = v as AdminPosition | '')"
          />
        </div>
        <!-- 데스크톱: 칩 -->
        <div class="hidden md:block">
          <FilterChips v-model="form.position" :options="positions" />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex gap-2">
        <BaseButton variant="ghost" block @click="emit('close')">취소</BaseButton>
        <BaseButton
          variant="primary"
          block
          :disabled="!form.email || !form.position"
          :loading="isLoading"
          @click="handleSubmit"
        >
          초대하기
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
