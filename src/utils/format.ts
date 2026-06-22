// 날짜·숫자 포맷 유틸 — 어드민 전역에서 공통으로 사용한다.

const pad = (n: number) => String(n).padStart(2, '0')

// 서버는 타임존 표기가 없는 UTC LocalDateTime 문자열(예: '2026-06-22T12:53:31.0269')을 내려준다.
// new Date()는 이를 브라우저 로컬(KST)로 해석해 9시간 밀리므로, 타임존이 없으면 UTC(Z)로 보정한다.
const parseServerDate = (value: string): Date => {
  const hasTz = /[zZ]$/.test(value) || /[+-]\d{2}:?\d{2}$/.test(value)
  const normalized = !hasTz && value.includes('T') ? `${value}Z` : value
  return new Date(normalized)
}

/** YYYY.MM.DD (값이 없으면 '-') */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const d = parseServerDate(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/** YYYY.MM.DD HH:mm (값이 없으면 '-') */
export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-'
  const d = parseServerDate(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** YYYY.MM.DD HH:mm:ss (값이 없으면 '-') */
export const formatDateTimeSec = (value: string | null | undefined): string => {
  if (!value) return '-'
  const d = parseServerDate(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${formatDateTime(value)}:${pad(d.getSeconds())}`
}

/** 천 단위 구분 숫자 (값이 없으면 '-') */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  return value.toLocaleString()
}
