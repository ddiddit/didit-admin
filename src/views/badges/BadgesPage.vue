<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { X } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { badgesApi } from '@/api/badges.api'
import type { Badge, BadgeHolder } from '@/types/badge'
import type { ProblemDetail } from '@/types/api'

const badges = ref<Badge[]>([])
const isLoading = ref(false)

const selectedBadge = ref<Badge | null>(null)
const holders = ref<BadgeHolder[]>([])
const isLoadingHolders = ref(false)

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

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const fetchBadges = async () => {
  isLoading.value = true
  try {
    const res = await badgesApi.list()
    badges.value = res.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '배지 목록을 불러오지 못했습니다.')
  } finally {
    isLoading.value = false
  }
}

const openHolders = async (badge: Badge) => {
  selectedBadge.value = badge
  holders.value = []
  isLoadingHolders.value = true
  try {
    const res = await badgesApi.holders(badge.id)
    holders.value = res.data.data
  } catch (error: unknown) {
    const problem = (error as any)?.response?.data as ProblemDetail | undefined
    toast.error(problem?.detail || '획득자 목록을 불러오지 못했습니다.')
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
      <div>
        <h2 class="text-heading2 font-semibold text-grey-13">배지 관리</h2>
        <p v-if="badges.length" class="mt-0.5 text-label1 text-grey-7">총 {{ badges.length }}개 배지</p>
      </div>

      <!-- 배지 테이블 -->
      <div class="overflow-x-auto rounded-2xl bg-surface border border-grey-5">
        <table class="w-full text-sm min-w-[600px]">
          <thead>
            <tr class="border-b border-grey-5 bg-grey-3">
              <th class="px-4 py-3.5 text-left text-caption1 font-semibold text-grey-7">배지명</th>
              <th class="px-4 py-3.5 text-left text-caption1 font-semibold text-grey-7 hidden md:table-cell">설명</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">조건</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">획득 유저 수</th>
              <th class="px-4 py-3.5 text-center text-caption1 font-semibold text-grey-7">획득자 보기</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-4">
            <tr v-if="badges.length === 0">
              <td colspan="5" class="py-16 text-center text-label1 text-grey-7">
                {{ isLoading ? '' : '배지가 없습니다.' }}
              </td>
            </tr>
            <tr
              v-for="badge in badges"
              :key="badge.id"
              class="hover:bg-grey-3 transition"
            >
              <td class="px-4 py-4 text-label1 font-medium text-grey-13">{{ badge.name }}</td>
              <td class="px-4 py-4 text-caption1 text-grey-7 hidden md:table-cell">{{ badge.description }}</td>
              <td class="px-4 py-4 text-center">
                <span class="badge-grey">{{ conditionLabel(badge.conditionType) }}</span>
              </td>
              <td class="px-4 py-4 text-center text-label1 font-semibold text-grey-13">
                {{ badge.acquiredCount.toLocaleString() }}
              </td>
              <td class="px-4 py-4 text-center">
                <button
                  @click="openHolders(badge)"
                  class="rounded-xl border border-grey-5 px-3 py-1.5 text-caption1 font-medium text-grey-8 hover:bg-grey-3 transition cursor-pointer"
                >
                  보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 획득자 모달 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedBadge"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          @click.self="closeHolders"
        >
          <div class="w-full max-w-md rounded-2xl bg-surface shadow-card">
            <div class="flex items-center justify-between px-5 py-4 border-b border-grey-5">
              <div>
                <h3 class="text-label1 font-semibold text-grey-13">{{ selectedBadge.name }} 획득자</h3>
                <p class="text-caption1 text-grey-7 mt-0.5">{{ selectedBadge.acquiredCount.toLocaleString() }}명 획득</p>
              </div>
              <button @click="closeHolders" class="text-grey-6 hover:text-grey-9 transition cursor-pointer">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="px-5 py-4 max-h-80 overflow-y-auto">
              <div v-if="isLoadingHolders" class="py-8 text-center text-caption1 text-grey-7">불러오는 중...</div>
              <div v-else-if="holders.length === 0" class="py-8 text-center text-caption1 text-grey-7">획득자가 없습니다.</div>
              <ul v-else class="divide-y divide-grey-4">
                <li
                  v-for="holder in holders"
                  :key="holder.userId"
                  class="flex items-center justify-between py-3"
                >
                  <div>
                    <p class="text-label1 text-grey-13">{{ holder.email || holder.nickname || '-' }}</p>
                    <p class="text-caption1 text-grey-7">{{ holder.nickname || '' }}</p>
                  </div>
                  <p class="text-caption1 text-grey-7">{{ formatDate(holder.acquiredAt) }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </DashboardLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
