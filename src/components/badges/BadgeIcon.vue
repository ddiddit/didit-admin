<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Award } from 'lucide-vue-next'
import { resolveBadgeIcon } from '@/utils/badgeIcon'

// 배지 아이콘 미리보기 컴포넌트.
// name/conditionType으로 로컬 SVG를 찾고, 없으면 iconUrl, 그래도 없으면 플레이스홀더를 보여준다.
const props = withDefaults(
  defineProps<{
    name?: string | null
    conditionType?: string | null
    iconUrl?: string | null
    size?: number
  }>(),
  { size: 40 },
)

const src = computed(() =>
  resolveBadgeIcon({ name: props.name, conditionType: props.conditionType, iconUrl: props.iconUrl }),
)

// 이미지 로드 실패 시 플레이스홀더로 폴백
const failed = ref(false)
watch(src, () => {
  failed.value = false
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-grey-2"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name ?? '배지'"
      class="h-full w-full object-contain"
      @error="failed = true"
    />
    <Award v-else class="text-grey-6" :style="{ width: `${size * 0.5}px`, height: `${size * 0.5}px` }" />
  </span>
</template>
