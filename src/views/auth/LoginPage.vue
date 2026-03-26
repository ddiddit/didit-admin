<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { authApi } from '@/api/auth.api'
import { tokenStorage } from '@/utils/token'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const isFormValid = computed(() => email.value.trim() !== '' && password.value.trim() !== '')

const submitLogin = async () => {
  if (!isFormValid.value || isLoading.value) return
  errorMessage.value = ''
  isLoading.value = true
  try {
    const response = await authApi.login({
      email: email.value.trim(),
      password: password.value,
    })
    const { accessToken, refreshToken } = response.data.data
    tokenStorage.setTokens(accessToken, refreshToken)
    await router.push('/notices')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    errorMessage.value = problem?.detail || '이메일과 비밀번호를 확인해주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-100">
    <BaseSpinner :show="isLoading" />
    <div class="w-full max-w-[500px] px-4">

      <!-- 로고 -->
      <div class="mb-8 text-center">
        <p class="text-sm text-neutral-400">더 간단해진 회고</p>
        <h1 class="mt-1 text-3xl font-bold text-neutral-900">didit</h1>
      </div>

      <!-- 카드 -->
      <div class="rounded-3xl bg-white px-8 py-10 shadow-sm">
        <h2 class="mb-6 text-lg font-semibold flex justify-center text-neutral-900">관리자 로그인</h2>

        <form class="space-y-4" @submit.prevent="submitLogin">
          <!-- 아이디 / 이메일 -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              이메일
            </label>
            <input
                v-model="email"
                type="text"
                placeholder="이메일을 입력해주세요"
                autocomplete="username"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <!-- 비밀번호 -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              비밀번호
            </label>
            <input
                v-model="password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                autocomplete="current-password"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <!-- 에러 -->
          <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
            {{ errorMessage }}
          </p>

          <BaseButton type="submit" :disabled="!isFormValid || isLoading">
                        <span class="flex items-center justify-center gap-2">
                            <BaseSpinner :show="isLoading" />
                            {{ isLoading ? '로그인 중' : '로그인' }}
                        </span>
          </BaseButton>
        </form>
      </div>

    </div>
  </div>
</template>