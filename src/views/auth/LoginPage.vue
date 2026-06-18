<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { authApi } from '@/api/auth.api'
import { tokenStorage } from '@/utils/token'
import { getErrorMessage } from '@/utils/error'

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
    const response = await authApi.login({ email: email.value.trim(), password: password.value })
    const { accessToken, refreshToken } = response.data.data
    tokenStorage.setTokens(accessToken, refreshToken)
    await router.push('/dashboard')
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error, '이메일과 비밀번호를 확인해주세요.')
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
        <h2 class="mb-6 text-body3 font-semibold text-grey-13 text-center">관리자 로그인</h2>

        <form class="space-y-4" @submit.prevent="submitLogin">
          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">이메일</label>
            <input
              v-model="email"
              type="text"
              placeholder="이메일을 입력해주세요"
              autocomplete="username"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">비밀번호</label>
            <input
              v-model="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              autocomplete="current-password"
              class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <p v-if="errorMessage" class="rounded-xl bg-danger/10 px-4 py-3 text-label1 text-danger">
            {{ errorMessage }}
          </p>

          <BaseButton type="submit" size="lg" block :disabled="!isFormValid" :loading="isLoading">
            {{ isLoading ? '로그인 중' : '로그인' }}
          </BaseButton>
        </form>
      </div>

    </div>
  </div>
</template>
