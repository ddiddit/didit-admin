<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronLeft } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { usersApi } from '@/api/users.api'
import { tokenStorage } from '@/utils/token'
import type { UserDetail } from '@/types/user'
import type { ProblemDetail } from '@/types/api'

const route = useRoute()
const router = useRouter()

const userDetail = ref<UserDetail | null>(null)
const isLoading = ref(false)
const isWithdrawing = ref(false)
const showWithdrawDialog = ref(false)

const isSuperAdmin = computed(() => tokenStorage.isSuperAdmin())

const fetchUser = async () => {
  isLoading.value = true
  try {
    const response = await usersApi.get(route.params.id as string)
    userDetail.value = response.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '유저 정보를 불러오지 못했습니다.')
    router.push('/users')
  } finally {
    isLoading.value = false
  }
}

const handleForceWithdraw = async () => {
  isWithdrawing.value = true
  try {
    await usersApi.forceWithdraw(route.params.id as string)
    toast.success('강제 탈퇴가 완료되었습니다.')
    showWithdrawDialog.value = false
    router.push('/users')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '강제 탈퇴에 실패했습니다.')
  } finally {
    isWithdrawing.value = false
  }
}

const jobLabel = (job: string | null) => {
  const map: Record<string, string> = { DEVELOPER: '개발자', PLANNER: '기획자', DESIGNER: '디자이너' }
  return job ? (map[job] ?? job) : '-'
}

const ageLabel = (age: string | null) => {
  const map: Record<string, string> = { AGE_20: '20대', AGE_30: '30대', AGE_40_PLUS: '40대+' }
  return age ? (map[age] ?? age) : '-'
}

const expLabel = (exp: string | null) => {
  const map: Record<string, string> = {
    LESS_THAN_1_YEAR: '1년 미만',
    YEARS_1_TO_2: '1~2년',
    YEARS_3_TO_5: '3~5년',
    YEARS_6_TO_9: '6~9년',
    YEARS_10_PLUS: '10년+',
  }
  return exp ? (map[exp] ?? exp) : '-'
}

const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    USER_LOGGED_IN: '로그인',
    USER_LOGGED_OUT: '로그아웃',
    USER_SIGNED_UP: '회원가입',
    USER_PROFILE_UPDATED: '프로필 수정',
    USER_WITHDREW: '회원 탈퇴',
    USER_FORCE_WITHDREW: '강제 탈퇴',
    USER_MARKETING_CONSENT_UPDATED: '마케팅 수신 동의 변경',
    RETROSPECTIVE_STARTED: '회고 시작',
    RETROSPECTIVE_SAVED: '회고 저장',
    RETROSPECTIVE_DELETED: '회고 삭제',
    RETROSPECTIVE_RESTARTED: '회고 재시작',
    BADGE_ACQUIRED: '뱃지 획득',
    PROJECT_CREATED: '프로젝트 생성',
    PROJECT_UPDATED: '프로젝트 수정',
    PROJECT_DELETED: '프로젝트 삭제',
  }
  return map[action] ?? action
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(fetchUser)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isWithdrawing" />

    <div class="flex min-h-full justify-center pt-6">
      <div class="w-full max-w-2xl space-y-5">

        <!-- 뒤로가기 -->
        <button
          @click="router.push('/users')"
          class="flex items-center gap-1 text-label1 text-grey-7 hover:text-grey-9 transition cursor-pointer"
        >
          <ChevronLeft class="w-4 h-4" />
          <span>목록으로</span>
        </button>

        <template v-if="userDetail">

          <!-- 프로필 카드 -->
          <div class="bg-surface rounded-2xl border border-grey-5 px-6 py-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-body3 font-semibold text-grey-13">유저 정보</h2>
              <span :class="userDetail.profile.deleted ? 'badge-red' : 'badge-green'">
                {{ userDetail.profile.deleted ? '탈퇴' : '활성' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p class="text-caption1 text-grey-7">이메일</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ userDetail.profile.email || '-' }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">닉네임</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ userDetail.profile.nickname || '-' }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">직무</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ jobLabel(userDetail.profile.job) }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">나이대</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ ageLabel(userDetail.profile.age) }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">연차</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ expLabel(userDetail.profile.experience) }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">소셜 로그인</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ userDetail.profile.provider }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">가입일</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ formatDate(userDetail.profile.createdAt) }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">마지막 로그인</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ formatDate(userDetail.profile.lastLoginAt) }}</p>
              </div>
              <div>
                <p class="text-caption1 text-grey-7">온보딩</p>
                <p class="mt-0.5 text-label1 text-grey-13">{{ userDetail.profile.onboardingCompleted ? '완료' : '미완료' }}</p>
              </div>
            </div>
          </div>

          <!-- 강제 탈퇴 (SUPER_ADMIN만) -->
          <div v-if="isSuperAdmin" class="bg-surface rounded-2xl border border-grey-5 px-6 py-5">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-label1 font-semibold text-grey-13">강제 탈퇴</h3>
                <p class="mt-0.5 text-caption1 text-grey-7">탈퇴 처리 후 되돌릴 수 없습니다.</p>
              </div>
              <button
                :disabled="userDetail.profile.deleted"
                @click="showWithdrawDialog = true"
                class="rounded-xl bg-danger px-4 py-2 text-label1 font-semibold text-white hover:bg-danger-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                강제 탈퇴
              </button>
            </div>
          </div>

          <!-- 활동 타임라인 -->
          <div class="bg-surface rounded-2xl border border-grey-5 px-6 py-5 space-y-4">
            <h3 class="text-label1 font-semibold text-grey-13">최근 활동 (최대 20건)</h3>

            <div v-if="userDetail.timeline.length === 0" class="py-8 text-center text-label1 text-grey-7">
              활동 내역이 없습니다.
            </div>

            <ol v-else class="relative border-l border-grey-5 space-y-6 ml-3">
              <li
                v-for="log in userDetail.timeline"
                :key="log.createdAt"
                class="ml-5"
              >
                <div class="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-surface bg-grey-5" />
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-label1 font-medium text-grey-13">{{ actionLabel(log.action) }}</p>
                    <p
                      v-if="log.action === 'RETROSPECTIVE_SAVED' && log.payload?.title"
                      class="mt-0.5 text-caption1 text-grey-7"
                    >
                      {{ log.payload.title }}
                    </p>
                    <p
                      v-else-if="log.action === 'BADGE_ACQUIRED' && log.payload?.badgeType"
                      class="mt-0.5 text-caption1 text-grey-7"
                    >
                      {{ log.payload.badgeType }}
                    </p>
                  </div>
                  <p class="flex-shrink-0 text-caption1 text-grey-7">{{ formatDate(log.createdAt) }}</p>
                </div>
              </li>
            </ol>
          </div>

        </template>
      </div>
    </div>

    <ConfirmDialog
      v-if="showWithdrawDialog"
      title="강제 탈퇴"
      :description="`${userDetail?.profile.email || '이 유저'}\n강제 탈퇴 처리하시겠습니까?`"
      confirm-text="탈퇴 처리"
      :is-danger="true"
      :is-loading="isWithdrawing"
      @close="showWithdrawDialog = false"
      @confirm="handleForceWithdraw"
    />

  </DashboardLayout>
</template>
