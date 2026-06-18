<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { MessageSquare } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import { inquiriesApi } from '@/api/inquiries.api'
import type { Inquiry } from '@/types/inquiry'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const router = useRouter()
const inquiries = ref<Inquiry[]>([])
const isLoading = ref(false)

const columns = [
  { key: 'content', label: '내용', align: 'left' as const, width: '35%' },
  { key: 'email', label: '작성자', align: 'center' as const, width: '22%' },
  { key: 'type', label: '유형', align: 'center' as const, width: '13%' },
  { key: 'status', label: '상태', align: 'center' as const, width: '15%' },
  { key: 'createdAt', label: '등록일', align: 'center' as const, width: '15%' },
]

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
    toast.error(getErrorMessage(error, '목록을 불러오지 못했습니다.'))
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
      <PageHeader title="문의사항" :subtitle="`총 ${inquiries.length}개`" />

      <DataTable
        :columns="columns"
        :rows="inquiries"
        row-key="id"
        min-width="min-w-[700px]"
        clickable
        :loading="isLoading"
        empty-message="등록된 문의가 없습니다."
        :empty-icon="MessageSquare"
        @row-click="(row) => router.push(`/inquiries/${row.id}`)"
      >
        <template #cell-content="{ row }">
          <span class="block truncate">{{ row.content }}</span>
        </template>
        <template #cell-email="{ row }">
          <span class="block truncate text-grey-8">{{ row.email }}</span>
        </template>
        <template #cell-type="{ row }">
          <span class="text-grey-8">{{ typeLabel(row.type) }}</span>
        </template>
        <template #cell-status="{ row }">
          <Badge :tone="row.status === 'PENDING' ? 'yellow' : 'green'">
            {{ row.status === 'PENDING' ? '대기' : '답변완료' }}
          </Badge>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-caption1 text-grey-7">{{ formatDate(row.createdAt) }}</span>
        </template>
      </DataTable>
    </div>
  </DashboardLayout>
</template>
