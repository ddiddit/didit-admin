<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Card from '@/components/common/Card.vue'
import Badge from '@/components/common/Badge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { achievementStatsApi } from '@/api/achievementStats.api'
import type { LevelStat, MissionStat, BadgeStat } from '@/types/achievementStats'
import { formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const levels = ref<LevelStat[]>([])
const missions = ref<MissionStat[]>([])
const badgeStats = ref<BadgeStat[]>([])
const isLoading = ref(false)

// 레벨 0(신규)~10 막대 — 응답에 없는 레벨은 0으로 채운다.
// Lv.0은 아직 레벨이 부여되지 않은 신규 유저를 의미한다.
const levelBars = computed(() => {
  const map = new Map(levels.value.map((l) => [l.level, l.userCount]))
  const rows = [] as { level: number; label: string; userCount: number; percentage: number }[]
  const max = Math.max(...levels.value.map((l) => l.userCount), 1)
  for (let lv = 0; lv <= 10; lv++) {
    const userCount = map.get(lv) ?? 0
    const label = lv === 0 ? '신규' : `Lv.${lv}`
    rows.push({ level: lv, label, userCount, percentage: (userCount / max) * 100 })
  }
  return rows
})

const categoryLabelMap: Record<string, string> = {
  CONSISTENCY: '꾸준함',
  PROJECT: '프로젝트',
  PATTERN: '패턴',
  ACCESS: '접속',
}
const categoryLabel = (category: string) => categoryLabelMap[category] ?? category

const fetchStats = async () => {
  isLoading.value = true
  try {
    const [levelRes, missionRes, badgeRes] = await Promise.all([
      achievementStatsApi.levels(),
      achievementStatsApi.missions(),
      achievementStatsApi.badges(),
    ])
    levels.value = levelRes.data.data
    missions.value = missionRes.data.data
    badgeStats.value = badgeRes.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '운영 통계를 불러오지 못했습니다.'))
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchStats)
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading" />

    <div class="space-y-5">
      <PageHeader title="운영 통계" subtitle="레벨 분포, 미션 현황, 배지 현황을 확인하세요." />

      <!-- 레벨 분포 -->
      <Card class="space-y-4">
        <h3 class="text-label1 font-semibold text-grey-13">레벨 분포</h3>
        <EmptyState v-if="!isLoading && levels.length === 0" message="레벨 데이터가 없습니다." />
        <ul v-else class="space-y-2.5">
          <li v-for="bar in levelBars" :key="bar.level" class="flex items-center gap-3">
            <span class="w-12 shrink-0 text-caption1 text-grey-7">{{ bar.label }}</span>
            <div class="h-3 flex-1 overflow-hidden rounded-full bg-grey-4">
              <div class="h-full rounded-full bg-primary transition-all" :style="{ width: `${bar.percentage}%` }" />
            </div>
            <span class="w-16 shrink-0 text-right text-label1 font-semibold text-grey-13 tabular-nums">
              {{ formatNumber(bar.userCount) }}
            </span>
          </li>
        </ul>
      </Card>

      <!-- 미션 현황 -->
      <Card class="space-y-4">
        <h3 class="text-label1 font-semibold text-grey-13">미션 현황</h3>
        <EmptyState v-if="!isLoading && missions.length === 0" message="미션 데이터가 없습니다." />
        <div v-else class="overflow-x-auto rounded-xl border border-grey-4">
          <table class="w-full min-w-[560px] text-center">
            <thead class="bg-grey-3 text-caption1 text-grey-7">
              <tr>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">레벨</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">진행 중</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">완료</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">실패</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">전체</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">완료율</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-grey-4">
              <tr v-for="m in missions" :key="m.level">
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 font-semibold text-grey-13">Lv.{{ m.level }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13 tabular-nums">{{ formatNumber(m.inProgress) }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13 tabular-nums">{{ formatNumber(m.completed) }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13 tabular-nums">{{ formatNumber(m.failed) }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 text-grey-13 tabular-nums">{{ formatNumber(m.total) }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 font-semibold text-primary tabular-nums">{{ (m.completionRate ?? 0).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- 배지 현황 -->
      <Card class="space-y-4">
        <h3 class="text-label1 font-semibold text-grey-13">배지 현황</h3>
        <EmptyState v-if="!isLoading && badgeStats.length === 0" message="배지 데이터가 없습니다." />
        <div v-else class="overflow-x-auto rounded-xl border border-grey-4">
          <table class="w-full min-w-[560px] text-center">
            <thead class="bg-grey-3 text-caption1 text-grey-7">
              <tr>
                <th class="whitespace-nowrap px-3 py-2.5 text-left font-medium">배지명</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">카테고리</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">상태</th>
                <th class="whitespace-nowrap px-3 py-2.5 text-center font-medium">획득 수</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-grey-4">
              <tr v-for="b in badgeStats" :key="b.badgeId">
                <td class="whitespace-nowrap px-3 py-2.5 text-left text-label1 font-medium text-grey-13">{{ b.name }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center">
                  <Badge tone="blue">{{ categoryLabel(b.category) }}</Badge>
                </td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center">
                  <Badge :tone="b.active ? 'green' : 'grey'">{{ b.active ? '활성' : '비활성' }}</Badge>
                </td>
                <td class="whitespace-nowrap px-3 py-2.5 text-center text-label1 font-semibold text-grey-13 tabular-nums">{{ formatNumber(b.acquiredCount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </DashboardLayout>
</template>
