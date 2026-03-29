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
const formSendPush = ref(false)
const formSendEmail = ref(false)
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
  formSendPush.value = false
  formSendEmail.value = false
  showStatusDropdown.value = false
  showFormModal.value = true
}

const openEdit = async (notice: Notice) => {
  isEdit.value = true
  selectedNotice.value = notice
  // 수정 시 상세 조회로 content 가져오기
  try {
    const response = await noticesApi.get(notice.id)
    const detail = response.data.data
    formTitle.value = detail.title
    formContent.value = detail.content
    formStatus.value = detail.status
    formSendPush.value = detail.sendPush
    formSendEmail.value = detail.sendEmail
  } catch {
    formTitle.value = notice.title
    formContent.value = ''
    formStatus.value = notice.status
    formSendPush.value = notice.sendPush
    formSendEmail.value = notice.sendEmail ?? false
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
      sendPush: formSendPush.value,
      sendEmail: formSendEmail.value,
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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

onMounted(fetchNotices)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSubmitting" />

    <div class="space-y-5">

      <!-- 헤더 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-neutral-900">공지사항</h2>
          <p class="mt-0.5 text-sm text-neutral-400">총 {{ notices.length }}개</p>
        </div>
        <button
            @click="openCreate"
            class="flex items-center gap-2 rounded-xl bg-primary px-4 h-[50px] text-sm font-semibold text-white hover:bg-primary-dark transition cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          공지 등록
        </button>
      </div>

      <!-- 테이블 (sm 이상) -->
      <div class="hidden sm:block overflow-hidden rounded-2xl bg-white border border-neutral-200">
        <table class="w-full text-sm table-fixed">
          <colgroup>
            <col class="w-[35%]" />
            <col class="w-[15%]" />
            <col class="w-[20%]" />
            <col class="w-[15%]" />
          </colgroup>
          <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th class="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">제목</th>
            <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">상태</th>
            <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">등록일</th>
            <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">액션</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
          <tr v-if="notices.length === 0">
            <td colspan="4" class="py-16 text-center text-sm text-neutral-400">
              등록된 공지사항이 없습니다.
            </td>
          </tr>
          <tr
              v-for="notice in notices"
              :key="notice.id"
              class="hover:bg-neutral-50 transition cursor-pointer"
              @click="openEdit(notice)"
          >
            <td class="px-5 py-4 text-neutral-900">
              <span class="block truncate">{{ notice.title }}</span>
            </td>
            <td class="px-5 py-4 text-center">
                <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="notice.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'"
                >
                  {{ notice.status === 'PUBLISHED' ? '게시' : '임시저장' }}
                </span>
            </td>
            <td class="px-5 py-4 text-center text-neutral-500">
              {{ formatDate(notice.createdAt) }}
            </td>
            <td class="px-5 py-4 text-center" @click.stop>
              <button
                  @click="openDelete(notice)"
                  class="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
              >
                삭제
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 카드 (sm 미만) -->
      <div class="sm:hidden space-y-3">
        <p v-if="notices.length === 0" class="py-16 text-center text-sm text-neutral-400">
          등록된 공지사항이 없습니다.
        </p>
        <div
            v-for="notice in notices"
            :key="notice.id"
            class="bg-white rounded-2xl border border-neutral-200 px-4 py-4 space-y-3 cursor-pointer"
            @click="openEdit(notice)"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="text-sm font-medium text-neutral-900 truncate">{{ notice.title }}</span>
            <span
                class="flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="notice.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'"
            >
              {{ notice.status === 'PUBLISHED' ? '게시' : '임시저장' }}
            </span>
          </div>
          <span class="text-xs text-neutral-400">{{ formatDate(notice.createdAt) }}</span>
          <div class="pt-2 border-t border-neutral-100" @click.stop>
            <button
                @click="openDelete(notice)"
                class="w-full rounded-lg bg-neutral-100 py-1.5 text-xs font-medium text-neutral-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- 작성/수정 모달 -->
    <Teleport to="body">
      <div
          v-if="showFormModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          @click.self="showFormModal = false"
      >
        <div class="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-visible">

          <div class="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
            <h3 class="text-base font-semibold text-neutral-900">
              {{ isEdit ? '공지사항 수정' : '공지사항 등록' }}
            </h3>
            <button @click="showFormModal = false" class="text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <Plus class="w-5 h-5 rotate-45" />
            </button>
          </div>

          <div class="px-6 py-5 space-y-4 overflow-visible">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">제목</label>
              <input
                  v-model="formTitle"
                  type="text"
                  placeholder="공지사항 제목을 입력해주세요"
                  class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">내용</label>
              <textarea
                  v-model="formContent"
                  placeholder="공지사항 내용을 입력해주세요"
                  rows="6"
                  class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <!-- 상태 -->
            <div class="relative">
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">상태</label>
              <button
                  type="button"
                  @click="showStatusDropdown = !showStatusDropdown"
                  class="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <span>{{ formStatus === 'PUBLISHED' ? '게시' : '임시저장' }}</span>
                <svg
                    class="w-4 h-4 text-neutral-400 transition-transform"
                    :class="showStatusDropdown ? 'rotate-180' : ''"
                    fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                  v-if="showStatusDropdown"
                  class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden"
              >
                <button
                    v-for="opt in [{ value: 'PUBLISHED', label: '게시' }, { value: 'DRAFT', label: '임시저장' }]"
                    :key="opt.value"
                    type="button"
                    @click="formStatus = opt.value as NoticeStatus; showStatusDropdown = false"
                    class="flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-neutral-50"
                    :class="formStatus === opt.value ? 'text-primary font-medium' : 'text-neutral-700'"
                >
                  {{ opt.label }}
                  <svg v-if="formStatus === opt.value" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 발송 채널 -->
            <div>
              <label class="mb-2 block text-sm font-medium text-neutral-700">발송 채널</label>
              <div class="flex items-center gap-5">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                      id="sendPush"
                      v-model="formSendPush"
                      type="checkbox"
                      class="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-neutral-700">푸시 알림</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                      id="sendEmail"
                      v-model="formSendEmail"
                      type="checkbox"
                      class="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-neutral-700">이메일</span>
                </label>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                  type="button"
                  @click="showFormModal = false"
                  class="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition cursor-pointer"
              >
                취소
              </button>
              <button
                  type="button"
                  :disabled="isSubmitting"
                  @click="handleSubmit"
                  class="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {{ isEdit ? '수정' : '등록' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- 삭제 다이얼로그 -->
    <ConfirmDialog
        v-if="showDeleteDialog"
        title="공지사항 삭제"
        :description="`'${selectedNotice?.title}' 공지사항을 삭제하시겠습니까?`"
        confirm-text="삭제"
        confirm-class="bg-red-500 hover:bg-red-400"
        :is-loading="isDeleting"
        @close="showDeleteDialog = false"
        @confirm="handleDelete"
    />

  </DashboardLayout>
</template>