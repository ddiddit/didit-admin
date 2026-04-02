<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { inquiriesApi } from '@/api/inquiries.api'
import type { Inquiry } from '@/types/inquiry'
import type { ProblemDetail } from '@/types/api'

const router = useRouter()
const inquiries = ref<Inquiry[]>([])
const isLoading = ref(false)

const typeLabel = (type: Inquiry['type']) => {
  const map = { USAGE: '이용', BUG: '버그', IMPROVEMENT: '개선', ETC: '기타' }
  return map[type] ?? type
}

const fetchInquiries = async () => {
  isLoading.value = true
  try {
    const response = await inquiriesApi.list()
    inquiries.value = response.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '목록을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const statusLabel = (status: Inquiry['status']) => {
  return status === 'PENDING' ? '대기' : '답변완료'
}

const statusClass = (status: Inquiry['status']) => {
  return status === 'PENDING'
    ? 'bg-yellow-50 text-yellow-600'
    : 'bg-primary/10 text-primary'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

onMounted(fetchInquiries)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">

      <!-- 헤더 -->
      <div>
        <h2 class="text-lg font-semibold text-neutral-900">문의사항</h2>
        <p class="mt-0.5 text-sm text-neutral-400">총 {{ inquiries.length }}개</p>
      </div>

      <!-- 테이블 (sm 이상) -->
      <div class="hidden sm:block overflow-hidden rounded-2xl bg-white border border-neutral-200">
        <table class="w-full text-sm table-fixed">
          <colgroup>
            <col class="w-[35%]" />
            <col class="w-[22%]" />
            <col class="w-[13%]" />
            <col class="w-[15%]" />
            <col class="w-[15%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-neutral-200 bg-neutral-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500">내용</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">작성자</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">유형</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">상태</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold text-neutral-500">등록일</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-if="inquiries.length === 0">
              <td colspan="5" class="py-16 text-center text-sm text-neutral-400">
                등록된 문의가 없습니다.
              </td>
            </tr>
            <tr
              v-for="inquiry in inquiries"
              :key="inquiry.id"
              class="hover:bg-neutral-50 transition cursor-pointer"
              @click="router.push(`/inquiries/${inquiry.id}`)"
            >
              <td class="px-5 py-4 text-neutral-900">
                <span class="block truncate">{{ inquiry.content }}</span>
              </td>
              <td class="px-5 py-4 text-center text-neutral-500">
                <span class="block truncate">{{ inquiry.email }}</span>
              </td>
              <td class="px-5 py-4 text-center text-neutral-500 whitespace-nowrap">
                {{ typeLabel(inquiry.type) }}
              </td>
              <td class="px-5 py-4 text-center">
                <span :class="['inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', statusClass(inquiry.status)]">
                  {{ statusLabel(inquiry.status) }}
                </span>
              </td>
              <td class="px-5 py-4 text-center text-neutral-500 whitespace-nowrap">
                {{ formatDate(inquiry.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 카드 (sm 미만) -->
      <div class="sm:hidden space-y-3">
        <p v-if="inquiries.length === 0" class="py-16 text-center text-sm text-neutral-400">
          등록된 문의가 없습니다.
        </p>
        <div
          v-for="inquiry in inquiries"
          :key="inquiry.id"
          class="bg-white rounded-2xl border border-neutral-200 px-4 py-4 space-y-3 cursor-pointer"
          @click="router.push(`/inquiries/${inquiry.id}`)"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="text-sm font-medium text-neutral-900 truncate">{{ inquiry.content }}</span>
            <span :class="['flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', statusClass(inquiry.status)]">
              {{ statusLabel(inquiry.status) }}
            </span>
          </div>
          <div class="flex flex-col gap-0.5 text-xs text-neutral-400">
            <span class="truncate">{{ inquiry.email }}</span>
            <div class="flex items-center justify-between">
              <span>{{ typeLabel(inquiry.type) }}</span>
              <span class="whitespace-nowrap">{{ formatDate(inquiry.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>