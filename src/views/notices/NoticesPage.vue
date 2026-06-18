<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, FileText } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import FilterChips from '@/components/common/FilterChips.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noticesApi } from '@/api/notices.api'
import type { Notice, NoticeStatus } from '@/types/notice'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const notices = ref<Notice[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)

const showFormModal = ref(false)
const showDeleteDialog = ref(false)
const selectedNotice = ref<Notice | null>(null)

const formTitle = ref('')
const formContent = ref('')
const formStatus = ref<NoticeStatus>('PUBLISHED')
const isEdit = ref(false)

const columns = [
  { key: 'title', label: '제목', align: 'left' as const, width: '40%' },
  { key: 'status', label: '상태', align: 'center' as const, width: '15%' },
  { key: 'sendPush', label: '발송', align: 'center' as const, width: '20%' },
  { key: 'createdAt', label: '등록일', align: 'center' as const, width: '15%' },
  { key: 'action', label: '액션', align: 'center' as const, width: '10%' },
]

const statusOptions: { value: NoticeStatus; label: string }[] = [
  { value: 'PUBLISHED', label: '게시' },
  { value: 'DRAFT', label: '임시저장' },
]

const fetchNotices = async () => {
  isLoading.value = true
  try {
    const response = await noticesApi.list()
    notices.value = response.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '목록을 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  isEdit.value = false
  formTitle.value = ''
  formContent.value = ''
  formStatus.value = 'PUBLISHED'
  showFormModal.value = true
}

const openEdit = async (notice: Notice) => {
  isEdit.value = true
  selectedNotice.value = notice
  try {
    const response = await noticesApi.get(notice.id)
    const detail = response.data.data
    formTitle.value = detail.title
    formContent.value = detail.content
    formStatus.value = detail.status
  } catch {
    formTitle.value = notice.title
    formContent.value = ''
    formStatus.value = notice.status
  }
  showFormModal.value = true
}

const openDelete = (notice: Notice) => {
  selectedNotice.value = notice
  showDeleteDialog.value = true
}

const handleSubmit = async () => {
  if (!formTitle.value.trim() || !formContent.value.trim()) {
    toast.error('제목과 내용을 입력해주세요.')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      title: formTitle.value,
      content: formContent.value,
      status: formStatus.value,
      // 백엔드 필수 필드. 푸시 발송은 미구현이라 항상 false 전송.
      sendPush: false,
    }
    if (isEdit.value) {
      await noticesApi.update(selectedNotice.value!.id, payload)
      toast.success('공지사항이 수정되었습니다.')
    } else {
      await noticesApi.create(payload)
      toast.success('공지사항이 등록되었습니다.')
    }
    showFormModal.value = false
    await fetchNotices()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '저장에 실패했습니다.'))
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!selectedNotice.value) return
  isDeleting.value = true
  try {
    await noticesApi.delete(selectedNotice.value.id)
    toast.success('공지사항이 삭제되었습니다.')
    showDeleteDialog.value = false
    await fetchNotices()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '삭제에 실패했습니다.'))
  } finally {
    isDeleting.value = false
  }
}

onMounted(fetchNotices)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSubmitting" />

    <div class="space-y-5">
      <PageHeader title="공지사항" :subtitle="`총 ${notices.length}개`">
        <template #actions>
          <BaseButton variant="primary" class="w-full sm:w-auto" @click="openCreate">
            <Plus class="h-4 w-4" />
            공지 등록
          </BaseButton>
        </template>
      </PageHeader>

      <DataTable
        :columns="columns"
        :rows="notices"
        row-key="id"
        min-width="min-w-[640px]"
        clickable
        :loading="isLoading"
        empty-message="등록된 공지사항이 없습니다."
        :empty-icon="FileText"
        @row-click="openEdit"
      >
        <template #cell-title="{ row }">
          <span class="block truncate">{{ row.title }}</span>
        </template>
        <template #cell-status="{ row }">
          <Badge :tone="row.status === 'PUBLISHED' ? 'green' : 'grey'">
            {{ row.status === 'PUBLISHED' ? '게시' : '임시저장' }}
          </Badge>
        </template>
        <template #cell-sendPush="{ row }">
          <span class="text-caption1 text-grey-7">{{ row.sendPush ? '푸시' : '-' }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-caption1 text-grey-7">{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #cell-action="{ row }">
          <button
            @click.stop="openDelete(row)"
            class="rounded-lg bg-grey-4 px-3 py-1.5 text-caption1 font-medium text-grey-7 transition hover:bg-danger/10 hover:text-danger cursor-pointer"
          >
            삭제
          </button>
        </template>
      </DataTable>
    </div>

    <!-- 작성/수정 모달 -->
    <BaseModal
      :show="showFormModal"
      :title="isEdit ? '공지사항 수정' : '공지사항 등록'"
      max-width="max-w-lg"
      @close="showFormModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">제목</label>
          <input
            v-model="formTitle"
            type="text"
            placeholder="공지사항 제목을 입력해주세요"
            class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">내용</label>
          <textarea
            v-model="formContent"
            placeholder="공지사항 내용을 입력해주세요"
            rows="6"
            class="w-full resize-none rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">상태</label>
          <FilterChips v-model="formStatus" :options="statusOptions" />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2">
          <BaseButton variant="ghost" block @click="showFormModal = false">취소</BaseButton>
          <BaseButton variant="primary" block :loading="isSubmitting" @click="handleSubmit">
            {{ isEdit ? '수정' : '등록' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-if="showDeleteDialog"
      title="공지사항 삭제"
      :description="`'${selectedNotice?.title}'\n공지사항을 삭제하시겠습니까?`"
      confirm-text="삭제"
      :is-danger="true"
      :is-loading="isDeleting"
      @close="showDeleteDialog = false"
      @confirm="handleDelete"
    />
  </DashboardLayout>
</template>
