// 배지 아이콘 매핑 유틸
//
// 프론트(didit-frontend)의 BADGE_CATALOG와 동일한 매핑이다.
// 어드민에서는 배지 아이콘을 "미리보기"로만 보여주며, 백엔드 iconUrl과 무관하게
// code로 로컬 SVG(/badges/{code}.svg)를 찾는다.
// SVG 원본은 didit-frontend/public/badges 와 동일한 파일을 public/badges에 복사해 사용한다.

interface BadgeIconDef {
  code: string // 이미지 파일명 (public/badges/{code}.svg)
  name: string // 배지 이름 (백엔드 name과 매칭)
  conditionType?: string // 백엔드 조건 타입 (있으면 우선 매칭)
}

// 프론트 BADGE_CATALOG와 동일 (그리드 표시 순서)
const BADGE_ICON_CATALOG: BadgeIconDef[] = [
  { code: 'first-record', name: '첫 기록', conditionType: 'FIRST_RETRO' },
  { code: 'record-10', name: '10회 기록' },
  { code: 'record-30', name: '30회 기록', conditionType: 'TOTAL_30' },
  { code: 'project-collector', name: '프로젝트 컬렉터' },
  { code: 'project-picker', name: '프로젝트 피커' },
  { code: 'project-digger', name: '프로젝트 디기너' },
  { code: 'routine-first', name: '루틴의 첫 걸음', conditionType: 'WEEKLY_3_FIRST' },
  { code: 'routine-power', name: '루틴의 힘', conditionType: 'WEEKLY_3_THREE_WEEKS' },
  { code: 'routine-streak', name: '루틴의 지속' },
  { code: 'didit-lover', name: '디딧 러버' },
]

const byConditionType = new Map(
  BADGE_ICON_CATALOG.filter((d) => d.conditionType).map((d) => [d.conditionType as string, d]),
)
const byName = new Map(BADGE_ICON_CATALOG.map((d) => [d.name, d]))

export interface BadgeIconInput {
  name?: string | null
  conditionType?: string | null
  iconUrl?: string | null
}

// 배지에 대응하는 아이콘 경로를 찾는다.
// 매칭 우선순위: conditionType → 이름 → 백엔드 iconUrl. 못 찾으면 null.
export function resolveBadgeIcon(badge: BadgeIconInput): string | null {
  const def =
    (badge.conditionType ? byConditionType.get(badge.conditionType) : undefined) ??
    (badge.name ? byName.get(badge.name.trim()) : undefined)
  if (def) return `/badges/${def.code}.svg`
  const url = badge.iconUrl?.trim()
  return url ? url : null
}
