<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, Award } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Badge from '@/components/common/Badge.vue'
import BadgeIcon from '@/components/badges/BadgeIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SelectField from '@/components/common/SelectField.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { badgesApi } from '@/api/badges.api'
import type {
  Badge as BadgeType,
  BadgeHolder,
  BadgeConditionMeta,
  BadgeConditionType,
  BadgeRequest,
} from '@/types/badge'
import { formatDate, formatNumber } from '@/utils/format'
import { getErrorMessage } from '@/utils/error'

const badges = ref<BadgeType[]>([])
const conditionMeta = ref<BadgeConditionMeta | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isToggling = ref(false)

// 획득자 모달
const selectedBadge = ref<BadgeType | null>(null)
const holders = ref<BadgeHolder[]>([])
const isLoadingHolders = ref(false)

// 등록/수정 모달
const showFormModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  description: '',
  category: '',
  conditionType: '',
  threshold: 0,
  iconUrl: '',
  congratsTitle: '',
  congratsMessage: '',
})
const formParams = ref<Record<string, string>>({})

// 활성/비활성 토글 다이얼로그
const showToggleDialog = ref(false)
const toggleTarget = ref<BadgeType | null>(null)

const columns = [
  { key: 'name', label: '배지명', align: 'left' as const, width: '22%' },
  { key: 'category', label: '카테고리', align: 'center' as const, width: '14%' },
  { key: 'conditionType', label: '조건', align: 'center' as const, width: '20%', hideBelow: 'md' as const },
  { key: 'threshold', label: '기준값', align: 'center' as const, width: '10%', hideBelow: 'md' as const },
  { key: 'active', label: '상태', align: 'center' as const, width: '12%' },
  { key: 'acquiredCount', label: '획득 수', align: 'center' as const, width: '10%' },
  { key: 'action', label: '액션', align: 'center' as const, width: '12%' },
]

const categoryOptions = computed(() =>
  (conditionMeta.value?.categories ?? []).map((c) => ({ value: c.category, label: c.label })),
)
const conditionTypeOptions = computed(() =>
  (conditionMeta.value?.conditionTypes ?? []).map((c) => ({ value: c.conditionType, label: c.label })),
)

const selectedConditionType = computed<BadgeConditionType | null>(
  () => conditionMeta.value?.conditionTypes.find((c) => c.conditionType === form.value.conditionType) ?? null,
)
const conditionDescription = computed(() => selectedConditionType.value?.description ?? '')
const conditionParams = computed(() => selectedConditionType.value?.params ?? [])

const categoryLabel = (category: string) =>
  conditionMeta.value?.categories.find((c) => c.category === category)?.label ?? category
const conditionLabel = (type: string) =>
  conditionMeta.value?.conditionTypes.find((c) => c.conditionType === type)?.label ?? type

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

const fetchConditionTypes = async () => {
  try {
    const res = await badgesApi.conditionTypes()
    conditionMeta.value = res.data.data
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '배지 조건 정보를 불러오지 못했습니다.'))
  }
}

// conditionType 변경 시 해당 조건의 파라미터 입력값을 기본값으로 초기화
const onConditionTypeChange = (value: string) => {
  form.value.conditionType = value
  const params: Record<string, string> = {}
  for (const p of conditionParams.value) {
    params[p.key] = p.defaultValue != null ? String(p.defaultValue) : ''
  }
  formParams.value = params
}

const openCreate = () => {
  isEdit.value = false
  editingId.value = null
  form.value = {
    name: '',
    description: '',
    category: categoryOptions.value[0]?.value ?? '',
    conditionType: '',
    threshold: 0,
    iconUrl: '',
    congratsTitle: '',
    congratsMessage: '',
  }
  formParams.value = {}
  showFormModal.value = true
}

const openEdit = async (badge: BadgeType) => {
  isEdit.value = true
  editingId.value = badge.id
  // 최신 상세를 불러오되, 실패하면 목록 데이터로 폴백
  let detail = badge
  try {
    const res = await badgesApi.get(badge.id)
    detail = res.data.data
  } catch {
    /* 폴백: 목록 데이터 사용 */
  }
  form.value = {
    name: detail.name,
    description: detail.description,
    category: detail.category,
    conditionType: detail.conditionType,
    threshold: detail.threshold,
    iconUrl: detail.iconUrl ?? '',
    congratsTitle: detail.congratsTitle ?? '',
    congratsMessage: detail.congratsMessage ?? '',
  }
  const params: Record<string, string> = {}
  const metaParams =
    conditionMeta.value?.conditionTypes.find((c) => c.conditionType === detail.conditionType)?.params ?? []
  for (const p of metaParams) {
    const existing = detail.params?.[p.key]
    params[p.key] = existing != null ? String(existing) : p.defaultValue != null ? String(p.defaultValue) : ''
  }
  formParams.value = params
  showFormModal.value = true
}

const buildPayload = (): BadgeRequest => {
  const payload: BadgeRequest = {
    name: form.value.name.trim(),
    description: form.value.description.trim(),
    category: form.value.category,
    conditionType: form.value.conditionType,
    threshold: Number(form.value.threshold) || 0,
  }
  if (form.value.iconUrl.trim()) payload.iconUrl = form.value.iconUrl.trim()
  if (form.value.congratsTitle.trim()) payload.congratsTitle = form.value.congratsTitle.trim()
  if (form.value.congratsMessage.trim()) payload.congratsMessage = form.value.congratsMessage.trim()

  if (conditionParams.value.length > 0) {
    const params: Record<string, unknown> = {}
    for (const p of conditionParams.value) {
      const raw = formParams.value[p.key]
      if (raw === undefined || raw === '') continue
      const isNumeric = p.type === 'number' || p.type === 'integer'
      params[p.key] = isNumeric ? Number(raw) : raw
    }
    if (Object.keys(params).length > 0) payload.params = params
  }
  return payload
}

const handleSubmit = async () => {
  if (!form.value.name.trim() || !form.value.description.trim()) {
    toast.error('배지명과 설명을 입력해주세요.')
    return
  }
  if (!form.value.category || !form.value.conditionType) {
    toast.error('카테고리와 조건을 선택해주세요.')
    return
  }
  isSubmitting.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value && editingId.value) {
      await badgesApi.update(editingId.value, payload)
      toast.success('배지가 수정되었습니다.')
    } else {
      await badgesApi.create(payload)
      toast.success('배지가 등록되었습니다.')
    }
    showFormModal.value = false
    await fetchBadges()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '저장에 실패했습니다.'))
  } finally {
    isSubmitting.value = false
  }
}

const openToggle = (badge: BadgeType) => {
  toggleTarget.value = badge
  showToggleDialog.value = true
}

const handleToggle = async () => {
  if (!toggleTarget.value) return
  const next = !toggleTarget.value.active
  isToggling.value = true
  try {
    await badgesApi.changeActive(toggleTarget.value.id, next)
    toast.success(next ? '배지가 활성화되었습니다.' : '배지가 비활성화되었습니다.')
    showToggleDialog.value = false
    await fetchBadges()
  } catch (error: unknown) {
    toast.error(getErrorMessage(error, '상태 변경에 실패했습니다.'))
  } finally {
    isToggling.value = false
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

const inputClass =
  'w-full rounded-xl border border-grey-5 bg-grey-3 px-4 py-3 text-label1 font-medium text-grey-13 placeholder:text-grey-7 placeholder:font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

onMounted(async () => {
  await Promise.all([fetchConditionTypes(), fetchBadges()])
})
</script>

<template>
  <DashboardLayout>
    <BaseSpinner :show="isLoading || isSubmitting" />

    <div class="space-y-5">
      <PageHeader title="배지 관리" :subtitle="badges.length ? `총 ${badges.length}개 배지` : undefined">
        <template #actions>
          <BaseButton variant="primary" class="w-full sm:w-auto" @click="openCreate">
            <Plus class="h-4 w-4" />
            배지 등록
          </BaseButton>
        </template>
      </PageHeader>

      <DataTable
        :columns="columns"
        :rows="badges"
        row-key="id"
        min-width="min-w-[720px]"
        :loading="isLoading"
        empty-message="배지가 없습니다."
        :empty-icon="Award"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <BadgeIcon
              :name="row.name"
              :condition-type="row.conditionType"
              :icon-url="row.iconUrl"
              :size="40"
            />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
        <template #cell-category="{ row }">
          <Badge tone="blue">{{ categoryLabel(row.category) }}</Badge>
        </template>
        <template #cell-conditionType="{ row }">
          <Badge tone="grey">{{ conditionLabel(row.conditionType) }}</Badge>
        </template>
        <template #cell-threshold="{ row }">
          <span class="text-caption1 text-grey-7">{{ formatNumber(row.threshold) }}</span>
        </template>
        <template #cell-active="{ row }">
          <Badge :tone="row.active ? 'green' : 'grey'">{{ row.active ? '활성' : '비활성' }}</Badge>
        </template>
        <template #cell-acquiredCount="{ row }">
          <span class="font-semibold">{{ formatNumber(row.acquiredCount) }}</span>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <BaseButton variant="ghost" size="sm" @click="openEdit(row)">수정</BaseButton>
            <BaseButton variant="ghost" size="sm" @click="openHolders(row)">획득자</BaseButton>
            <button
              @click="openToggle(row)"
              :class="[
                'rounded-lg px-3 py-1.5 text-caption1 font-medium transition cursor-pointer',
                row.active
                  ? 'bg-grey-4 text-grey-7 hover:bg-danger/10 hover:text-danger'
                  : 'bg-green-light text-green-dark hover:bg-primary/10',
              ]"
            >
              {{ row.active ? '비활성화' : '활성화' }}
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- 등록/수정 모달 -->
    <BaseModal
      :show="showFormModal"
      :title="isEdit ? '배지 수정' : '배지 등록'"
      max-width="max-w-lg"
      @close="showFormModal = false"
    >
      <div class="space-y-4">
        <!-- 아이콘 미리보기 (이름/조건으로 매칭) -->
        <div class="flex items-center gap-3 rounded-xl border border-grey-4 bg-grey-2 p-3">
          <BadgeIcon
            :name="form.name"
            :condition-type="form.conditionType"
            :icon-url="form.iconUrl"
            :size="56"
          />
          <div class="min-w-0">
            <p class="text-label1 font-medium text-grey-13">{{ form.name || '배지 미리보기' }}</p>
            <p class="text-caption1 text-grey-7">이름·조건에 맞는 배지 아이콘이 표시됩니다.</p>
          </div>
        </div>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">배지명</label>
          <input v-model="form.name" type="text" placeholder="배지명을 입력해주세요" :class="inputClass" />
        </div>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">설명</label>
          <textarea
            v-model="form.description"
            placeholder="배지 설명을 입력해주세요"
            rows="2"
            :class="['resize-none', inputClass]"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">카테고리</label>
            <SelectField v-model="form.category" :options="categoryOptions" min-width="100%" />
          </div>
          <div>
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">조건</label>
            <SelectField
              :model-value="form.conditionType"
              :options="conditionTypeOptions"
              min-width="100%"
              @update:model-value="onConditionTypeChange"
            />
          </div>
        </div>
        <p v-if="conditionDescription" class="-mt-2 text-caption1 text-grey-7">{{ conditionDescription }}</p>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">기준값 (threshold)</label>
          <input v-model.number="form.threshold" type="number" min="0" placeholder="0" :class="inputClass" />
        </div>

        <!-- 조건별 추가 파라미터 -->
        <div v-if="conditionParams.length" class="space-y-3 rounded-xl border border-grey-4 bg-grey-2 p-4">
          <p class="text-caption1 font-semibold text-grey-7">추가 파라미터</p>
          <div v-for="param in conditionParams" :key="param.key">
            <label class="mb-1.5 block text-label1 font-medium text-grey-9">
              {{ param.label }}
              <span v-if="param.required" class="text-danger">*</span>
            </label>
            <input
              v-model="formParams[param.key]"
              :type="param.type === 'number' || param.type === 'integer' ? 'number' : 'text'"
              :placeholder="param.label"
              :class="inputClass"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">아이콘 URL (선택)</label>
          <input v-model="form.iconUrl" type="text" placeholder="https://..." :class="inputClass" />
        </div>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">축하 제목 (선택)</label>
          <input v-model="form.congratsTitle" type="text" placeholder="축하 제목" :class="inputClass" />
        </div>
        <div>
          <label class="mb-1.5 block text-label1 font-medium text-grey-9">축하 메시지 (선택)</label>
          <textarea
            v-model="form.congratsMessage"
            placeholder="축하 메시지"
            rows="2"
            :class="['resize-none', inputClass]"
          />
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

    <!-- 활성/비활성 토글 -->
    <ConfirmDialog
      v-if="showToggleDialog"
      :title="toggleTarget?.active ? '배지 비활성화' : '배지 활성화'"
      :description="
        toggleTarget?.active
          ? `'${toggleTarget?.name}' 배지를 비활성화하시겠습니까?\n비활성화해도 데이터는 보존되며 사용자에게 노출되지 않습니다.`
          : `'${toggleTarget?.name}' 배지를 활성화하시겠습니까?`
      "
      :confirm-text="toggleTarget?.active ? '비활성화' : '활성화'"
      :is-danger="toggleTarget?.active"
      :is-loading="isToggling"
      @close="showToggleDialog = false"
      @confirm="handleToggle"
    />
  </DashboardLayout>
</template>
