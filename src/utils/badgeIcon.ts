// 배지 아이콘 매핑 유틸
//
// 프론트(didit-frontend)의 BADGE_CATALOG와 동일한 매핑이다.
// 어드민에서는 배지 아이콘을 "미리보기"로만 보여주며, 백엔드 iconUrl과 무관하게
// code로 로컬 SVG(/badges/{code}.svg)를 찾는다.
// SVG 원본은 didit-frontend/public/badges 와 동일한 파일을 public/badges에 복사해 사용한다.

interface BadgeIconDef {
  code: string // 이미지 파일명 (public/badges/{code}.svg)
  name: string // 배지 이름 (백엔드 name과 매칭 — 10종 모두 고유)
  conditionType?: string // 백엔드 조건 타입 (고유한 경우만 보조 매칭에 사용)
}

// 백엔드 시드(V39__redefine_badges_seed.sql) 기준 배지 10종.
// name은 백엔드 name과 1:1로 매칭된다(모두 고유). conditionType은 CUMULATIVE_RETRO(3종)·
// WEEKLY_STREAK(2종)처럼 여러 배지가 공유하므로 고유한 타입만 보조 매칭에 쓴다.
const BADGE_ICON_CATALOG: BadgeIconDef[] = [
  { code: 'first-record', name: '첫 기록', conditionType: 'CUMULATIVE_RETRO' },
  { code: 'record-10', name: '10회 기록', conditionType: 'CUMULATIVE_RETRO' },
  { code: 'record-30', name: '30회 기록', conditionType: 'CUMULATIVE_RETRO' },
  { code: 'project-collector', name: '컬렉터', conditionType: 'PROJECT_COUNT' },
  { code: 'project-picker', name: '피커', conditionType: 'PROJECT_TAGGED_RETRO' },
  { code: 'project-digger', name: '디깅', conditionType: 'PROJECT_RETRO_IN_ONE' },
  { code: 'routine-first', name: '루틴 첫걸음', conditionType: 'WEEKLY_RETRO_COUNT' },
  { code: 'routine-power', name: '루틴의 힘', conditionType: 'WEEKLY_STREAK' },
  { code: 'routine-streak', name: '루틴의 지속', conditionType: 'WEEKLY_STREAK' },
  { code: 'didit-lover', name: '디딧 러버', conditionType: 'DAILY_ACCESS_STREAK' },
]

const byName = new Map(BADGE_ICON_CATALOG.map((d) => [d.name, d]))

// conditionType이 정확히 하나의 배지에만 쓰일 때만 보조 매칭에 사용(공유 타입은 제외)
const conditionTypeCount = BADGE_ICON_CATALOG.reduce<Map<string, number>>((acc, d) => {
  if (d.conditionType) acc.set(d.conditionType, (acc.get(d.conditionType) ?? 0) + 1)
  return acc
}, new Map())
const byConditionType = new Map(
  BADGE_ICON_CATALOG.filter(
    (d) => d.conditionType && conditionTypeCount.get(d.conditionType) === 1,
  ).map((d) => [d.conditionType as string, d]),
)

export interface BadgeIconInput {
  name?: string | null
  conditionType?: string | null
  iconUrl?: string | null
}

// 배지에 대응하는 아이콘 경로를 찾는다.
// 매칭 우선순위: 이름(고유) → conditionType(고유한 것만) → 백엔드 iconUrl. 못 찾으면 null.
export function resolveBadgeIcon(badge: BadgeIconInput): string | null {
  const def =
    (badge.name ? byName.get(badge.name.trim()) : undefined) ??
    (badge.conditionType ? byConditionType.get(badge.conditionType) : undefined)
  if (def) return `/badges/${def.code}.svg`
  const url = badge.iconUrl?.trim()
  return url ? url : null
}
