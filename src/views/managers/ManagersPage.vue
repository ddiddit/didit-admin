<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/DashboardLayout.vue'
import { adminApi } from '@/api/admin.api'
import type { Admin } from '@/types/admin'
import type { ProblemDetail } from '@/types/api'
import { UserPlus } from 'lucide-vue-next'
import InviteModal from '@/components/managers/InviteModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const admins = ref<Admin[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const showInviteModal = ref(false)

const selectedAdmin = ref<Admin | null>(null)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showDeleteDialog = ref(false)
const isActionLoading = ref(false)

const fetchAdmins = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await adminApi.list()
    admins.value = response.data.data.filter(admin => admin.role !== 'SUPER_ADMIN')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    errorMessage.value = problem?.detail || '목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const handleApprove = async () => {
  if (!selectedAdmin.value) return
  isActionLoading.value = true
  try {
    await adminApi.approve(selectedAdmin.value.id)
    showApproveDialog.value = false
    await fetchAdmins()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    errorMessage.value = problem?.detail || '승인에 실패했습니다.'
  } finally {
    isActionLoading.value = false
  }
}

const handleReject = async () => {
  if (!selectedAdmin.value) return
  isActionLoading.value = true
  try {
    await adminApi.reject(selectedAdmin.value.id)
    showRejectDialog.value = false
    await fetchAdmins()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    errorMessage.value = problem?.detail || '거절에 실패했습니다.'
  } finally {
    isActionLoading.value = false
  }
}

const handleDelete = async () => {
  if (!selectedAdmin.value) return
  isActionLoading.value = true
  try {
    await adminApi.delete(selectedAdmin.value.id)
    showDeleteDialog.value = false
    await fetchAdmins()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    errorMessage.value = problem?.detail || '삭제에 실패했습니다.'
  } finally {
    isActionLoading.value = false
  }
}

const statusLabel = (status: Admin['status']) => {
  const map = { PENDING: '대기', ACTIVE: '활성', REJECTED: '거절' }
  return map[status]
}

const statusClass = (status: Admin['status']) => {
  const map = {
    PENDING: 'bg-yellow-50 text-yellow-600',
    ACTIVE: 'bg-primary/10 text-primary',
    REJECTED: 'bg-red-50 text-red-500',
  }
  return map[status]
}

const positionLabel = (position?: Admin['position']) => {
  if (!position) return '-'
  const map = { PLANNER: '기획자', DESIGNER: '디자이너', DEVELOPER: '개발자' }
  return map[position]
}

onMounted(fetchAdmins)
</script>

<template>
  <AdminLayout>
    <div class="space-y-5">

      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">관리자 목록</h2>
          <p class="mt-0.5 text-sm text-neutral-400">총 {{ admins.length }}명</p>
        </div>
        <button
            @click="showInviteModal = true"
            class="flex items-center gap-2 rounded-xl bg-primary px-4 h-[50px] text-sm font-semibold text-white hover:bg-primary-dark transition cursor-pointer"
        >
          <UserPlus class="w-5 h-5" />
          관리자 초대
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <svg class="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>

      <!-- 에러 -->
      <div v-else-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
        {{ errorMessage }}
      </div>

      <template v-else>
        <!-- 테이블 (600px 이상) -->
        <div class="hidden sm:block overflow-hidden rounded-2xl bg-white border border-neutral-200">
          <table class="w-full text-sm table-fixed">
            <colgroup>
              <col class="w-[40%]" />
              <col class="w-[20%]" />
              <col class="w-[15%]" />
              <col class="w-[25%]" />
            </colgroup>
            <thead>
            <tr class="border-b border-neutral-200 bg-neutral-50">
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">이메일</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">직군</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">상태</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">액션</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
            <tr v-if="admins.length === 0">
              <td colspan="4" class="py-16 text-center text-sm text-neutral-400">
                등록된 관리자가 없습니다.
              </td>
            </tr>
            <tr
                v-for="admin in admins"
                :key="admin.id"
                class="hover:bg-neutral-50 transition"
            >
              <td class="px-5 py-4 text-center text-neutral-900">
                <span class="block truncate">{{ admin.email }}</span>
              </td>
              <td class="px-5 py-4 text-center text-neutral-600">
                {{ positionLabel(admin.position) }}
              </td>
              <td class="px-5 py-4 text-center">
                                    <span :class="['inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium', statusClass(admin.status)]">
                                        {{ statusLabel(admin.status) }}
                                    </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-2">
                  <template v-if="admin.status === 'PENDING'">
                    <button
                        @click="selectedAdmin = admin; showApproveDialog = true"
                        class="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
                    >
                      승인
                    </button>
                    <button
                        @click="selectedAdmin = admin; showRejectDialog = true"
                        class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-100 transition cursor-pointer"
                    >
                      거절
                    </button>
                  </template>
                  <button
                      @click="selectedAdmin = admin; showDeleteDialog = true"
                      class="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 카드 (600px 미만) -->
        <div class="sm:hidden space-y-3">
          <p v-if="admins.length === 0" class="py-16 text-center text-sm text-neutral-400">
            등록된 관리자가 없습니다.
          </p>
          <div
              v-for="admin in admins"
              :key="admin.id"
              class="bg-white rounded-2xl border border-neutral-200 px-4 py-4 space-y-3"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-neutral-900 truncate">{{ admin.email }}</span>
              <span :class="['flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', statusClass(admin.status)]">
                                {{ statusLabel(admin.status) }}
                            </span>
            </div>

            <div class="text-xs text-neutral-400">
              직군 <span class="text-neutral-600 font-medium ml-1">{{ positionLabel(admin.position) }}</span>
            </div>

            <div class="flex items-center gap-2 pt-1 border-t border-neutral-100">
              <template v-if="admin.status === 'PENDING'">
                <button
                    @click="selectedAdmin = admin; showApproveDialog = true"
                    class="flex-1 rounded-lg bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition cursor-pointer"
                >
                  승인
                </button>
                <button
                    @click="selectedAdmin = admin; showRejectDialog = true"
                    class="flex-1 rounded-lg bg-red-50 py-1.5 text-xs font-medium text-red-500 hover:bg-red-100 transition cursor-pointer"
                >
                  거절
                </button>
              </template>
              <button
                  @click="selectedAdmin = admin; showDeleteDialog = true"
                  class="flex-1 rounded-lg bg-neutral-100 py-1.5 text-xs font-medium text-neutral-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </template>

    </div>

    <!-- 초대 모달 -->
    <InviteModal
        v-if="showInviteModal"
        @close="showInviteModal = false"
        @invited="fetchAdmins"
    />

    <!-- 승인 다이얼로그 -->
    <ConfirmDialog
        v-if="showApproveDialog"
        title="관리자 승인"
        :description="`${selectedAdmin?.email} 계정을 승인하시겠습니까?`"
        confirm-text="승인"
        :is-loading="isActionLoading"
        @close="showApproveDialog = false"
        @confirm="handleApprove"
    />

    <!-- 거절 다이얼로그 -->
    <ConfirmDialog
        v-if="showRejectDialog"
        title="관리자 거절"
        :description="`${selectedAdmin?.email} 계정을 거절하시겠습니까?`"
        confirm-text="거절"
        confirm-class="bg-red-500 hover:bg-red-400"
        :is-loading="isActionLoading"
        @close="showRejectDialog = false"
        @confirm="handleReject"
    />

    <!-- 삭제 다이얼로그 -->
    <ConfirmDialog
        v-if="showDeleteDialog"
        title="관리자 삭제"
        :description="`${selectedAdmin?.email} 계정을 삭제하시겠습니까?`"
        confirm-text="삭제"
        confirm-class="bg-red-500 hover:bg-red-400"
        :is-loading="isActionLoading"
        @close="showDeleteDialog = false"
        @confirm="handleDelete"
    />

  </AdminLayout>
</template>