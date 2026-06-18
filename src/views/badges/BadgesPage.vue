<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Award } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { badgesApi } from '@/api/badges.api'
import type { Badge as BadgeType, BadgeHolder } from '@/types/badge'
import { formatDate, formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const badges = ref<BadgeType[]>([])
const isLoading = ref(false)

const selectedBadge = ref<BadgeType | null>(null)
const holders = ref<BadgeHolder[]>([])
const isLoadingHolders = ref(false)

const columns = [
  { key: 'name', label: '배지명', align: 'left' as const },
  { key: 'description', label: '설명', align: 'left' as const, hideBelow: 'md' as const },
  { key: 'conditionType', label: '조건', align: 'center' as const },
  { key: 'acquiredCount', label: '획득 유저 수', align: 'center' as const },
  { key: 'action', label: '획득자', align: 'center' as const },
]

const conditionLabel = (type: string) => {
  const map: Record<string, string> = {
    FIRST_RETRO: '첫 회고 작성',
    STREAK_3_DAYS: '3일 연속 접속',
    TOTAL_30: '누적 회고 30회',
    DEEP_QUESTION_1: '심화 질문 1회',
    DEEP_QUESTION_5: '심화 질문 5회',
    DEEP_QUESTION_10: '심화 질문 10회',
    WEEKLY_3_FIRST: '주 3회 첫 달성',
    WEEKLY_3_THREE_WEEKS: '주 3회 3주 연속',
  }
  return map[type] ?? type
}

const fetchBadges = async () => {
  isLoading.value = true
  try {
    const res = await badgesApi.list()
    badges.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '배지 목록을 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

const openHolders = async (badge: BadgeType) => {
  selectedBadge.value = badge
  holders.value = []
  isLoadingHolders.value = true
  try {
    const res = await badgesApi.holders(badge.id)
    holders.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '획득자 목록을 불러오지 못했습니다.'))
  } finally {
    isLoadingHolders.value = false
  }
}

const closeHolders = () => {
  selectedBadge.value = null
  holders.value = []
}

onMounted(fetchBadges)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="배지 관리" :subtitle="badges.length ? `총 ${badges.length}개 배지` : undefined" />

      <DataTable
        :columns="columns"
        :rows="badges"
        row-key="id"
        min-width="min-w-[600px]"
        :loading="isLoading"
        empty-message="배지가 없습니다."
        :empty-icon="Award"
      >
        <template #cell-name="{ row }">
          <span class="font-medium">{{ row.name }}</span>
        </template>
        <template #cell-description="{ row }">
          <span class="text-caption1 text-grey-7">{{ row.description }}</span>
        </template>
        <template #cell-conditionType="{ row }">
          <Badge tone="grey">{{ conditionLabel(row.conditionType) }}</Badge>
        </template>
        <template #cell-acquiredCount="{ row }">
          <span class="font-semibold">{{ formatNumber(row.acquiredCount) }}</span>
        </template>
        <template #cell-action="{ row }">
          <BaseButton variant="ghost" size="sm" @click="openHolders(row)">보기</BaseButton>
        </template>
      </DataTable>
    </div>

    <!-- 획득자 모달 -->
    <BaseModal
      v-if="selectedBadge"
      :show="true"
      :title="`${selectedBadge.name} 획득자`"
      :subtitle="`${formatNumber(selectedBadge.acquiredCount)}명 획득`"
      @close="closeHolders"
    >
      <div v-if="isLoadingHolders" class="py-8 text-center text-caption1 text-grey-7">불러오는 중...</div>
      <EmptyState v-else-if="holders.length === 0" message="획득자가 없습니다." />
      <ul v-else class="divide-y divide-grey-4">
        <li
          v-for="holder in holders"
          :key="holder.userId"
          class="flex items-center justify-between py-3"
        >
          <div class="min-w-0">
            <p class="truncate text-label1 text-grey-13">{{ holder.email || holder.nickname || '-' }}</p>
            <p v-if="holder.nickname" class="text-caption1 text-grey-7">{{ holder.nickname }}</p>
          </div>
          <p class="shrink-0 text-caption1 text-grey-7">{{ formatDate(holder.acquiredAt) }}</p>
        </li>
      </ul>
    </BaseModal>
  </DashboardLayout>
</template>
