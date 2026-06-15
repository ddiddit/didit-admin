<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Plus } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { noticesApi } from '@/api/notices.api'
import type { Notice, NoticeStatus } from '@/types/notice'
import type { ProblemDetail } from '@/types/api'

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
const showStatusDropdown = ref(false)

const fetchNotices = async () => {
  isLoading.value = true
  try {
    const response = await noticesApi.list()
    notices.value = response.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '목록을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const openCreate = () => {
  isEdit.value = false
  formTitle.value = ''
  formContent.value = ''
  formStatus.value = 'PUBLISHED'
  showStatusDropdown.value = false
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
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '저장에 실패했습니다.')
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
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '삭제에 실패했습니다.')
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

onMounted(fetchNotices)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSubmitting" />

    <div class="space-y-5">

      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-heading2 font-semibold text-grey-13">공지사항</h2>
          <p class="mt-0.5 text-label1 text-grey-7">총 {{ notices.length }}개</p>
        </div>
        <button
          @click="openCreate"
          class="flex items-center gap-2 rounded-xl bg-primary px-4 h-[44px] text-label1 font-semibold text-white hover:bg-green-hover transition cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          공지 등록
        </button>
      </div>

      <!-- 테이블 -->
      <div class="overflow-hidden rounded-2xl bg-surface border border-grey-5">
        <table class="w-full text-sm table-fixed">
          <colgroup>
            <col class="w-[40%]" />
            <col class="w-[15%]" />
            <col class="w-[20%]" />
            <col class="w-[10%]" />
            <col class="w-[15%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-grey-5 bg-grey-3">
              <th class="px-5 py-3.5 text-left text-caption1 font-semibold text-grey-7">제목</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">상태</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">발송</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">등록일</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">액션</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-4">
            <tr v-if="notices.length === 0">
              <td colspan="5" class="py-16 text-center text-label1 text-grey-7">
                등록된 공지사항이 없습니다.
              </td>
            </tr>
            <tr
              v-for="notice in notices"
              :key="notice.id"
              class="hover:bg-grey-3 transition cursor-pointer"
              @click="openEdit(notice)"
            >
              <td class="px-5 py-4 text-label1 text-grey-13">
                <span class="block truncate">{{ notice.title }}</span>
              </td>
              <td class="px-5 py-4 text-center">
                <span :class="notice.status === 'PUBLISHED' ? 'badge-green' : 'badge-grey'">
                  {{ notice.status === 'PUBLISHED' ? '게시' : '임시저장' }}
                </span>
              </td>
              <td class="px-5 py-4 text-center text-caption1 text-grey-7">
                <span v-if="notice.sendPush" class="mr-1">푸시</span>
                <span v-if="notice.sendEmail">이메일</span>
                <span v-if="!notice.sendPush && !notice.sendEmail">-</span>
              </td>
              <td class="px-5 py-4 text-center text-caption1 text-grey-7">
                {{ formatDate(notice.createdAt) }}
              </td>
              <td class="px-5 py-4 text-center" @click.stop>
                <button
                  @click="openDelete(notice)"
                  class="rounded-lg bg-grey-4 px-3 py-1.5 text-caption1 font-medium text-grey-7 hover:bg-danger/10 hover:text-danger transition cursor-pointer"
                >
                  삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- 작성/수정 모달 -->
    <Teleport to="body">
      <div
        v-if="showFormModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
        @click.self="showFormModal = false"
      >
        <div class="w-full max-w-lg bg-surface rounded-2xl shadow-card overflow-visible">

          <div class="flex items-center justify-between px-6 py-5 border-b border-grey-5">
            <h3 class="text-body3 font-semibold text-grey-13">
              {{ isEdit ? '공지사항 수정' : '공지사항 등록' }}
            </h3>
            <button @click="showFormModal = false" class="text-grey-6 hover:text-grey-9 cursor-pointer transition">
              <Plus class="w-5 h-5 rotate-45" />
            </button>
          </div>

          <div class="px-6 py-5 space-y-4 overflow-visible">
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
                class="w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <!-- 상태 -->
            <div class="relative">
              <label class="mb-1.5 block text-label1 font-medium text-grey-9">상태</label>
              <button
                type="button"
                @click="showStatusDropdown = !showStatusDropdown"
                class="flex w-full items-center justify-between rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <span>{{ formStatus === 'PUBLISHED' ? '게시' : '임시저장' }}</span>
                <svg class="w-4 h-4 text-grey-7 transition-transform" :class="showStatusDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="showStatusDropdown" class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-grey-5 bg-surface shadow-card overflow-hidden">
                <button
                  v-for="opt in [{ value: 'PUBLISHED', label: '게시' }, { value: 'DRAFT', label: '임시저장' }]"
                  :key="opt.value"
                  type="button"
                  @click="formStatus = opt.value as NoticeStatus; showStatusDropdown = false"
                  class="flex w-full items-center justify-between px-4 py-2.5 text-label1 transition hover:bg-grey-3"
                  :class="formStatus === opt.value ? 'text-primary font-semibold' : 'text-grey-9'"
                >
                  {{ opt.label }}
                  <svg v-if="formStatus === opt.value" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <button type="button" @click="showFormModal = false" class="flex-1 rounded-xl border border-grey-5 py-2.5 text-label1 font-medium text-grey-7 hover:bg-grey-3 transition cursor-pointer">
                취소
              </button>
              <button type="button" :disabled="isSubmitting" @click="handleSubmit" class="flex-1 rounded-xl bg-primary py-2.5 text-label1 font-semibold text-white hover:bg-green-hover transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {{ isEdit ? '수정' : '등록' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

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
