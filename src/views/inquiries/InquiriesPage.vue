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

const statusLabel = (status: Inquiry['status']) => status === 'PENDING' ? '대기' : '답변완료'
const statusClass = (status: Inquiry['status']) =>
  status === 'PENDING' ? 'badge-yellow' : 'badge-green'

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

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

onMounted(fetchInquiries)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">

      <!-- 헤더 -->
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">문의사항</h2>
        <p class="mt-0.5 text-label1 text-grey-7">총 {{ inquiries.length }}개</p>
      </div>

      <!-- 테이블 -->
      <div class="overflow-hidden rounded-2xl bg-surface border border-grey-5">
        <table class="w-full text-sm table-fixed">
          <colgroup>
            <col class="w-[35%]" />
            <col class="w-[22%]" />
            <col class="w-[13%]" />
            <col class="w-[15%]" />
            <col class="w-[15%]" />
          </colgroup>
          <thead>
            <tr class="border-b border-grey-5 bg-grey-3">
              <th class="px-5 py-3.5 text-left text-caption1 font-semibold text-grey-7">내용</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">작성자</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">유형</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">상태</th>
              <th class="px-5 py-3.5 text-center text-caption1 font-semibold text-grey-7">등록일</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-4">
            <tr v-if="inquiries.length === 0">
              <td colspan="5" class="py-16 text-center text-label1 text-grey-7">
                등록된 문의가 없습니다.
              </td>
            </tr>
            <tr
              v-for="inquiry in inquiries"
              :key="inquiry.id"
              class="hover:bg-grey-3 transition cursor-pointer"
              @click="router.push(`/inquiries/${inquiry.id}`)"
            >
              <td class="px-5 py-4 text-label1 text-grey-13">
                <span class="block truncate">{{ inquiry.content }}</span>
              </td>
              <td class="px-5 py-4 text-center text-label1 text-grey-8">
                <span class="block truncate">{{ inquiry.email }}</span>
              </td>
              <td class="px-5 py-4 text-center text-label1 text-grey-8 whitespace-nowrap">
                {{ typeLabel(inquiry.type) }}
              </td>
              <td class="px-5 py-4 text-center">
                <span :class="['inline-flex items-center justify-center whitespace-nowrap', statusClass(inquiry.status)]">
                  {{ statusLabel(inquiry.status) }}
                </span>
              </td>
              <td class="px-5 py-4 text-center text-caption1 text-grey-7 whitespace-nowrap">
                {{ formatDate(inquiry.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </DashboardLayout>
</template>
