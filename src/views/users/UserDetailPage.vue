<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import BackLink from '@/components/common/BackLink.vue'
import Card from '@/components/common/Card.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { usersApi } from '@/api/users.api'
import { tokenStorage } from '@/utils/token'
import type { UserDetail } from '@/types/user'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

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
    toast.error(getErrorMessage(error, '유저 정보를 불러오지 못했습니다.'))
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
    toast.error(getErrorMessage(error, '강제 탈퇴에 실패했습니다.'))
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
    LESS_THAN_1_YEAR: '1년 미만', YEARS_1_TO_2: '1~2년', YEARS_3_TO_5: '3~5년',
    YEARS_6_TO_9: '6~9년', YEARS_10_PLUS: '10년+',
  }
  return exp ? (map[exp] ?? exp) : '-'
}
const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    USER_LOGGED_IN: '로그인', USER_LOGGED_OUT: '로그아웃', USER_SIGNED_UP: '회원가입',
    USER_PROFILE_UPDATED: '프로필 수정', USER_WITHDREW: '회원 탈퇴', USER_FORCE_WITHDREW: '강제 탈퇴',
    USER_MARKETING_CONSENT_UPDATED: '마케팅 수신 동의 변경',
    RETROSPECTIVE_STARTED: '회고 시작', RETROSPECTIVE_SAVED: '회고 저장',
    RETROSPECTIVE_DELETED: '회고 삭제', RETROSPECTIVE_RESTARTED: '회고 재시작',
    BADGE_ACQUIRED: '뱃지 획득', PROJECT_CREATED: '프로젝트 생성',
    PROJECT_UPDATED: '프로젝트 수정', PROJECT_DELETED: '프로젝트 삭제',
  }
  return map[action] ?? action
}

interface ProfileField { label: string; value: string }
const profileFields = computed<ProfileField[]>(() => {
  const p = userDetail.value?.profile
  if (!p) return []
  return [
    { label: '이메일', value: p.email || '-' },
    { label: '닉네임', value: p.nickname || '-' },
    { label: '직무', value: jobLabel(p.job) },
    { label: '나이대', value: ageLabel(p.age) },
    { label: '연차', value: expLabel(p.experience) },
    { label: '소셜 로그인', value: p.provider },
    { label: '가입일', value: formatDateTime(p.createdAt) },
    { label: '마지막 로그인', value: formatDateTime(p.lastLoginAt) },
    { label: '온보딩', value: p.onboardingCompleted ? '완료' : '미완료' },
  ]
})

onMounted(fetchUser)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isWithdrawing" />

    <div class="mx-auto w-full max-w-6xl space-y-5 pt-2">
      <BackLink @click="router.push('/users')" />

      <template v-if="userDetail">
        <!-- PC: 좌(정보·강제탈퇴) / 우(활동) 2단, 모바일: 세로 스택 -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
          <!-- 왼쪽 -->
          <div class="space-y-5">
            <!-- 프로필 카드 -->
            <Card class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-body3 font-semibold text-grey-13">유저 정보</h2>
                <Badge :tone="userDetail.profile.deleted ? 'red' : 'green'">
                  {{ userDetail.profile.deleted ? '탈퇴' : '활성' }}
                </Badge>
              </div>
              <div class="grid grid-cols-2 gap-x-8 gap-y-3">
                <div v-for="field in profileFields" :key="field.label">
                  <p class="text-caption1 text-grey-7">{{ field.label }}</p>
                  <p class="mt-0.5 break-all text-label1 text-grey-13">{{ field.value }}</p>
                </div>
              </div>
            </Card>

            <!-- 강제 탈퇴 (SUPER_ADMIN만) -->
            <Card v-if="isSuperAdmin">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-label1 font-semibold text-grey-13">강제 탈퇴</h3>
                  <p class="mt-0.5 text-caption1 text-grey-7">탈퇴 처리 후 되돌릴 수 없습니다.</p>
                </div>
                <BaseButton
                  variant="danger"
                  :disabled="userDetail.profile.deleted"
                  @click="showWithdrawDialog = true"
                >
                  강제 탈퇴
                </BaseButton>
              </div>
            </Card>
          </div>

          <!-- 오른쪽: 활동 타임라인 -->
          <Card class="space-y-4">
            <h3 class="text-label1 font-semibold text-grey-13">최근 활동 (최대 20건)</h3>
            <EmptyState v-if="userDetail.timeline.length === 0" message="활동 내역이 없습니다." />
            <ol v-else class="relative ml-3 space-y-6 border-l border-grey-5 lg:max-h-[440px] lg:overflow-y-auto lg:pr-3">
              <li v-for="log in userDetail.timeline" :key="log.createdAt" class="ml-5">
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
                  <p class="shrink-0 text-caption1 text-grey-7">{{ formatDateTime(log.createdAt) }}</p>
                </div>
              </li>
            </ol>
          </Card>
        </div>
      </template>
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
