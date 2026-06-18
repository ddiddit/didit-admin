<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { UserPlus, Users } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { adminApi } from '@/api/admin.api'
import type { Admin } from '@/types/admin'
import InviteModal from '@/components/managers/InviteModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getErrorMessage } from '@/utils/error'

const admins = ref<Admin[]>([])
const isLoading = ref(false)
const showInviteModal = ref(false)

const selectedAdmin = ref<Admin | null>(null)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showDeleteDialog = ref(false)
const isActionLoading = ref(false)

const columns = [
  { key: 'email', label: '이메일', align: 'left' as const, width: '45%' },
  { key: 'position', label: '직군', align: 'center' as const, width: '20%' },
  { key: 'status', label: '상태', align: 'center' as const, width: '15%' },
  { key: 'action', label: '액션', align: 'center' as const, width: '20%' },
]

const fetchAdmins = async () => {
  isLoading.value = true
  try {
    const response = await adminApi.list()
    admins.value = response.data.data.filter(admin => admin.role !== 'SUPER_ADMIN')
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '목록을 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

const runAction = async (fn: () => Promise<unknown>, successMsg: string, failMsg: string, close: () => void) => {
  isActionLoading.value = true
  try {
    await fn()
    toast.success(successMsg)
    close()
    await fetchAdmins()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, failMsg))
  } finally {
    isActionLoading.value = false
  }
}

const handleApprove = () =>
  runAction(() => adminApi.approve(selectedAdmin.value!.id), '승인되었습니다.', '승인에 실패했습니다.', () => (showApproveDialog.value = false))
const handleReject = () =>
  runAction(() => adminApi.reject(selectedAdmin.value!.id), '거절되었습니다.', '거절에 실패했습니다.', () => (showRejectDialog.value = false))
const handleDelete = () =>
  runAction(() => adminApi.delete(selectedAdmin.value!.id), '삭제되었습니다.', '삭제에 실패했습니다.', () => (showDeleteDialog.value = false))

const statusLabel = (status: Admin['status']) => ({ PENDING: '대기', ACTIVE: '활성', REJECTED: '거절' }[status])
const statusTone = (status: Admin['status']): 'yellow' | 'green' | 'red' =>
  status === 'PENDING' ? 'yellow' : status === 'ACTIVE' ? 'green' : 'red'
const positionLabel = (position?: Admin['position']) =>
  position ? { PLANNER: '기획자', DESIGNER: '디자이너', DEVELOPER: '개발자' }[position] : '-'

onMounted(fetchAdmins)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isActionLoading" />

    <div class="space-y-5">
      <PageHeader title="관리자 관리" :subtitle="`총 ${admins.length}명`">
        <template #actions>
          <BaseButton variant="primary" class="w-full sm:w-auto" @click="showInviteModal = true">
            <UserPlus class="h-4 w-4" />
            관리자 초대
          </BaseButton>
        </template>
      </PageHeader>

      <DataTable
        :columns="columns"
        :rows="admins"
        row-key="id"
        min-width="min-w-[560px]"
        :loading="isLoading"
        empty-message="등록된 관리자가 없습니다."
        :empty-icon="Users"
      >
        <template #cell-email="{ row }">
          <span class="block truncate">{{ row.email }}</span>
        </template>
        <template #cell-position="{ row }">
          <span class="text-grey-8">{{ positionLabel(row.position) }}</span>
        </template>
        <template #cell-status="{ row }">
          <Badge :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</Badge>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <template v-if="row.status === 'PENDING'">
              <button
                @click="selectedAdmin = row; showApproveDialog = true"
                class="rounded-lg bg-green-light px-3 py-1.5 text-caption1 font-medium text-green-dark transition hover:bg-green-light-hover cursor-pointer"
              >
                승인
              </button>
              <button
                @click="selectedAdmin = row; showRejectDialog = true"
                class="rounded-lg bg-danger/10 px-3 py-1.5 text-caption1 font-medium text-danger transition hover:bg-danger/20 cursor-pointer"
              >
                거절
              </button>
            </template>
            <button
              @click="selectedAdmin = row; showDeleteDialog = true"
              class="rounded-lg bg-grey-4 px-3 py-1.5 text-caption1 font-medium text-grey-7 transition hover:bg-danger/10 hover:text-danger cursor-pointer"
            >
              삭제
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <InviteModal v-if="showInviteModal" @close="showInviteModal = false" @invited="fetchAdmins" />

    <ConfirmDialog
      v-if="showApproveDialog"
      title="관리자 승인"
      :description="`${selectedAdmin?.email}\n계정을 승인하시겠습니까?`"
      confirm-text="승인"
      :is-loading="isActionLoading"
      @close="showApproveDialog = false"
      @confirm="handleApprove"
    />
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
