<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { X } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

type TargetType = 'all' | 'specific'
type SendType = 'push' | 'email' | 'both'

const isSending = ref(false)
const targetType = ref<TargetType>('all')
const sendType = ref<SendType>('push')
const title = ref('')
const body = ref('')

// 특정 사용자 이메일 목록
const emailInput = ref('')
const emailList = ref<string[]>([])

const addEmail = () => {
  const val = emailInput.value.trim()
  if (!val) return
  if (!val.includes('@')) {
    toast.error('올바른 이메일 형식을 입력해주세요.')
    return
  }
  if (emailList.value.includes(val)) {
    toast.error('이미 추가된 이메일입니다.')
    return
  }
  emailList.value.push(val)
  emailInput.value = ''
}

const removeEmail = (email: string) => {
  emailList.value = emailList.value.filter(e => e !== email)
}

const handleEmailKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    addEmail()
  }
}

const handleSend = async () => {
  if (!title.value.trim() || !body.value.trim()) {
    toast.error('제목과 내용을 입력해주세요.')
    return
  }
  if (targetType.value === 'specific' && emailList.value.length === 0) {
    toast.error('발송 대상 이메일을 입력해주세요.')
    return
  }

  isSending.value = true
  try {
    // await notificationApi.send({ ... })
    toast.success('알림이 발송되었습니다.')
    title.value = ''
    body.value = ''
    emailList.value = []
    emailInput.value = ''
  } catch {
    toast.error('알림 발송에 실패했습니다.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isSending" />

    <div class="flex min-h-full justify-center pt-10">
      <div class="w-full max-w-2xl space-y-5">

        <!-- 헤더 -->
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">알림 발송</h2>
          <p class="mt-0.5 text-sm text-neutral-400">푸시 알림 및 이메일을 발송합니다.</p>
        </div>

        <!-- 발송 대상 -->
        <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
          <h3 class="text-sm font-semibold text-neutral-900">발송 대상</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
                v-for="item in [
                  { value: 'all', label: '전체 사용자' },
                  { value: 'specific', label: '특정 사용자' },
                ]"
                :key="item.value"
                type="button"
                @click="targetType = item.value as TargetType"
                :class="[
                  'rounded-xl py-2.5 text-sm font-medium border transition cursor-pointer',
                  targetType === item.value
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-primary/50'
                ]"
            >
              {{ item.label }}
            </button>
          </div>

          <!-- 특정 사용자 이메일 입력 -->
          <div v-if="targetType === 'specific'" class="space-y-2">
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">이메일</label>

            <!-- 태그 목록 -->
            <div v-if="emailList.length > 0" class="flex flex-wrap gap-2">
              <span
                  v-for="email in emailList"
                  :key="email"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
              >
                {{ email }}
                <button type="button" @click="removeEmail(email)" class="hover:text-primary-dark cursor-pointer">
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>

            <!-- 입력 -->
            <div class="flex gap-2">
              <input
                  v-model="emailInput"
                  type="email"
                  placeholder="이메일 입력 후 Enter 또는 추가 버튼"
                  @keydown="handleEmailKeydown"
                  class="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                  type="button"
                  @click="addEmail"
                  class="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        <!-- 발송 유형 -->
        <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
          <h3 class="text-sm font-semibold text-neutral-900">발송 유형</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
                v-for="item in [
                  { value: 'push', label: '푸시 알림' },
                  { value: 'email', label: '이메일' },
                  { value: 'both', label: '둘 다' },
                ]"
                :key="item.value"
                type="button"
                @click="sendType = item.value as SendType"
                :class="[
                  'rounded-xl py-2.5 text-sm font-medium border transition cursor-pointer',
                  sendType === item.value
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-primary/50'
                ]"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- 내용 -->
        <div class="bg-white rounded-2xl border border-neutral-200 px-6 py-5 space-y-4">
          <h3 class="text-sm font-semibold text-neutral-900">내용</h3>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">제목</label>
            <input
                v-model="title"
                type="text"
                placeholder="알림 제목을 입력해주세요"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">내용</label>
            <textarea
                v-model="body"
                placeholder="알림 내용을 입력해주세요"
                rows="4"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <!-- 발송 버튼 -->
        <BaseButton type="button" :disabled="isSending" @click="handleSend">
          {{ isSending ? '발송 중' : '발송하기' }}
        </BaseButton>

      </div>
    </div>
  </DashboardLayout>
</template>