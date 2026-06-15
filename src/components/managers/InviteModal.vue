<script setup lang="ts">
import { ref, reactive } from 'vue'
import { toast } from 'vue-sonner'
import { X } from 'lucide-vue-next'
import { adminApi } from '@/api/admin.api'
import type { AdminPosition } from '@/types/admin'
import type { ProblemDetail } from '@/types/api'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

const emit = defineEmits<{
  close: []
  invited: []
}>()

const positions: { value: AdminPosition; label: string }[] = [
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
    emit('invited')
    emit('close')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '초대에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <BaseSpinner :show="isLoading" />
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" @click.self="emit('close')">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-card">

        <!-- 헤더 -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-grey-5">
          <h3 class="text-body3 font-semibold text-grey-13">관리자 초대</h3>
          <button @click="emit('close')" class="text-grey-6 hover:text-grey-9 cursor-pointer transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 바디 -->
        <form class="px-6 py-5 space-y-4" @submit.prevent="handleSubmit">

          <!-- 이메일 -->
          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">이메일</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="초대할 이메일을 입력해주세요"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <!-- 직군 -->
          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">직군</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="pos in positions"
                :key="pos.value"
                type="button"
                @click="form.position = pos.value"
                :class="[
                  'rounded-xl py-2.5 text-label1 font-medium border transition cursor-pointer',
                  form.position === pos.value
                    ? 'bg-green-light border-primary text-green-dark font-semibold'
                    : 'bg-grey-3 border-grey-5 text-grey-8 hover:border-primary/50'
                ]"
              >
                {{ pos.label }}
              </button>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-2 pt-1">
            <button
              type="button"
              @click="emit('close')"
              class="flex-1 rounded-xl border border-grey-5 py-2.5 text-label1 font-medium text-grey-7 hover:bg-grey-3 transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              :disabled="!form.email || !form.position || isLoading"
              class="flex-1 rounded-xl bg-primary py-2.5 text-label1 font-semibold text-white hover:bg-green-hover transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              초대하기
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
