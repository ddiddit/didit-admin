<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { adminApi } from '@/api/admin.api'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()
const route = useRoute()

const token = computed(() => route.query.token as string | undefined)

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const isLoading = ref(false)

const isFormValid = computed(() =>
  email.value.trim() !== '' &&
  password.value.trim() !== '' &&
  password.value === passwordConfirm.value
)

const passwordMismatch = computed(() =>
  passwordConfirm.value !== '' && password.value !== passwordConfirm.value
)

onMounted(() => {
  if (!token.value) router.replace('/login')
})

const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value || !token.value) return
  isLoading.value = true
  try {
    await adminApi.register(token.value, { email: email.value.trim(), password: password.value })
    await router.push('/login')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '계정 생성에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background">
    <BaseSpinner :show="isLoading" />
    <div class="w-full max-w-[480px] px-4">

      <!-- 로고 -->
      <div class="mb-8 text-center">
        <p class="text-label1 text-grey-7">더 간단해진 회고</p>
        <h1 class="mt-1 text-title1 font-bold text-grey-13">didit</h1>
      </div>

      <!-- 카드 -->
      <div class="rounded-3xl bg-surface px-8 py-10 shadow-card">
        <div class="mb-6 text-center">
          <h2 class="text-body3 font-semibold text-grey-13">관리자 계정 생성</h2>
          <p class="mt-1 text-label1 text-grey-7">초대받은 이메일과 사용할 비밀번호를 입력해주세요</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">이메일</label>
            <input
              v-model="email"
              type="email"
              placeholder="초대받은 이메일을 입력해주세요"
              autocomplete="email"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">비밀번호</label>
            <input
              v-model="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              autocomplete="new-password"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">비밀번호 확인</label>
            <input
              v-model="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              autocomplete="new-password"
              :class="[
                'w-full rounded-xl border bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition',
                passwordMismatch
                  ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                  : 'border-grey-5 focus:border-primary focus:ring-2 focus:ring-primary/20'
              ]"
            />
            <p v-if="passwordMismatch" class="mt-1.5 text-caption1 text-danger">
              비밀번호가 일치하지 않습니다.
            </p>
          </div>

          <BaseButton type="submit" :disabled="!isFormValid || isLoading">
            계정 생성
          </BaseButton>
        </form>
      </div>

    </div>
  </div>
</template>
