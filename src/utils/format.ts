// 날짜·숫자 포맷 유틸 — 어드민 전역에서 공통으로 사용한다.

const pad = (n: number) => String(n).padStart(2, '0')

/** YYYY.MM.DD (값이 없으면 '-') */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/** YYYY.MM.DD HH:mm (값이 없으면 '-') */
export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** YYYY.MM.DD HH:mm:ss (값이 없으면 '-') */
export const formatDateTimeSec = (value: string | null | undefined): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${formatDateTime(value)}:${pad(d.getSeconds())}`
}

/** 천 단위 구분 숫자 (값이 없으면 '-') */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  return value.toLocaleString()
}
