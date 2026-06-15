<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { UserPlus } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { adminApi } from '@/api/admin.api'
import type { Admin } from '@/types/admin'
import type { ProblemDetail } from '@/types/api'
import InviteModal from '@/components/managers/InviteModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

const admins = ref<Admin[]>([])
const isLoading = ref(false)
const showInviteModal = ref(false)

const selectedAdmin = ref<Admin | null>(null)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showDeleteDialog = ref(false)
const isActionLoading = ref(false)

const fetchAdmins = async () => {
  isLoading.value = true
  try {
    const response = await adminApi.list()
    admins.value = response.data.data.filter(admin => admin.role !== 'SUPER_ADMIN')
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '목록을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleApprove = async () => {
  if (!selectedAdmin.value) return
  isActionLoading.value = true
  try {
    await adminApi.approve(selectedAdmin.value.id)
    toast.success('승인되었습니다.')
    showApproveDialog.value = false
    await fetchAdmins()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '승인에 실패했습니다.')
  } finally {
    isActionLoading.value = false
  }
}

const handleReject = async () => {
  if (!selectedAdmin.value) return
  isActionLoading.value = true
  try {
    await adminApi.reject(selectedAdmin.value.id)
    toast.success('거절되었습니다.')
    showRejectDialog.value = false
    await fetchAdmins()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '거절에 실패했습니다.')
  } finally {
    isActionLoading.value = false
  }
}

const handleDelete = async () => {
  if (!selectedAdmin.value) return
  isActionLoading.value = true
  try {
    await adminApi.delete(selectedAdmin.value.id)
    toast.success('삭제되었습니다.')
    showDeleteDialog.value = false
    await fetchAdmins()
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '삭제에 실패했습니다.')
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
    PENDING: 'badge-yellow',
    ACTIVE: 'badge-green',
    REJECTED: 'badge-red',
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
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isActionLoading" />

    <div class="space-y-5">

      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-heading2 font-semibold text-grey-13">관리자 목록</h2>
          <p class="mt-0.5 text-label1 text-grey-7">총 {{ admins.length }}명</p>
        </div>
        <button
          @click="showInviteModal = true"
          class="flex items-center gap-2 rounded-xl bg-primary px-4 h-[44px] text-label1 font-semibold text-white hover:bg-green-hover transition cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          관리자 초대
        </button>
      </div>

      <!-- 테이블 (sm 이상) -->
      <div class="hidden sm:block overflow-hidden rounded-2xl bg-surface border border-grey-5">
        <table class="w-full text-sm table-fixed">
          <colgroup>
            <col class="w-[40%]" />
            <col class="w-[20%]" />
            <col class="w-[15%]" />
            <col class="w-[25%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-grey-5 bg-grey-3">
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">이메일</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">직군</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">상태</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">액션</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-4">
            <tr v-if="admins.length === 0">
              <td colspan="4" class="py-16 text-center text-label1 text-grey-7">
                등록된 관리자가 없습니다.
              </td>
            </tr>
            <tr v-for="admin in admins" :key="admin.id" class="hover:bg-grey-3 transition">
              <td class="px-5 py-4 text-center text-label1 text-grey-13">
                <span class="block truncate">{{ admin.email }}</span>
              </td>
              <td class="px-5 py-4 text-center text-label1 text-grey-8">
                {{ positionLabel(admin.position) }}
              </td>
              <td class="px-5 py-4 text-center">
                <span :class="statusClass(admin.status)">
                  {{ statusLabel(admin.status) }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-2">
                  <template v-if="admin.status === 'PENDING'">
                    <button
                      @click="selectedAdmin = admin; showApproveDialog = true"
                      class="rounded-lg bg-green-light px-3 py-1.5 text-caption1 font-medium text-green-dark hover:bg-green-light-hover transition cursor-pointer"
                    >
                      승인
                    </button>
                    <button
                      @click="selectedAdmin = admin; showRejectDialog = true"
                      class="rounded-lg bg-danger/10 px-3 py-1.5 text-caption1 font-medium text-danger hover:bg-danger/20 transition cursor-pointer"
                    >
                      거절
                    </button>
                  </template>
                  <button
                    @click="selectedAdmin = admin; showDeleteDialog = true"
                    class="rounded-lg bg-grey-4 px-3 py-1.5 text-caption1 font-medium text-grey-7 hover:bg-danger/10 hover:text-danger transition cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 카드 (sm 미만) -->
      <div class="sm:hidden space-y-3">
        <p v-if="admins.length === 0" class="py-16 text-center text-label1 text-grey-7">
          등록된 관리자가 없습니다.
        </p>
        <div
          v-for="admin in admins"
          :key="admin.id"
          class="bg-surface rounded-2xl border border-grey-5 px-4 py-4 space-y-3"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-label1 font-medium text-grey-13 truncate">{{ admin.email }}</span>
            <span :class="['flex-shrink-0', statusClass(admin.status)]">
              {{ statusLabel(admin.status) }}
            </span>
          </div>

          <div class="text-caption1 text-grey-7">
            직군 <span class="text-grey-9 font-medium ml-1">{{ positionLabel(admin.position) }}</span>
          </div>

          <div class="flex items-center gap-2 pt-1 border-t border-grey-4">
            <template v-if="admin.status === 'PENDING'">
              <button
                @click="selectedAdmin = admin; showApproveDialog = true"
                class="flex-1 rounded-lg bg-green-light py-1.5 text-caption1 font-medium text-green-dark hover:bg-green-light-hover transition cursor-pointer"
              >
                승인
              </button>
              <button
                @click="selectedAdmin = admin; showRejectDialog = true"
                class="flex-1 rounded-lg bg-danger/10 py-1.5 text-caption1 font-medium text-danger hover:bg-danger/20 transition cursor-pointer"
              >
                거절
              </button>
            </template>
            <button
              @click="selectedAdmin = admin; showDeleteDialog = true"
              class="flex-1 rounded-lg bg-grey-4 py-1.5 text-caption1 font-medium text-grey-7 hover:bg-danger/10 hover:text-danger transition cursor-pointer"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

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
      :description="`${selectedAdmin?.email}\n계정을 승인하시겠습니까?`"
      confirm-text="승인"
      :is-loading="isActionLoading"
      @close="showApproveDialog = false"
      @confirm="handleApprove"
    />

    <!-- 거절 다이얼로그 -->
    <ConfirmDialog
      v-if="showRejectDialog"
      title="관리자 거절"
      :description="`${selectedAdmin?.email}\n계정을 거절하시겠습니까?`"
      confirm-text="거절"
      :is-danger="true"
      :is-loading="isActionLoading"
      @close="showRejectDialog = false"
      @confirm="handleReject"
    />

    <!-- 삭제 다이얼로그 -->
    <ConfirmDialog
      v-if="showDeleteDialog"
      title="관리자 삭제"
      :description="`${selectedAdmin?.email}\n계정을 삭제하시겠습니까?`"
      confirm-text="삭제"
      :is-danger="true"
      :is-loading="isActionLoading"
      @close="showDeleteDialog = false"
      @confirm="handleDelete"
    />

  </DashboardLayout>
</template>
