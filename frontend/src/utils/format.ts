/**
 * 금액을 읽기 좋은 한국어 단위로 포맷
 * - 1만 미만: 9,900원
 * - 1만 이상: 1.1만원 (소수점 불필요시 생략 → 2만원)
 */
export const formatCost = (val: number | null | undefined): string => {
  if (val == null) { return '-' }
  if (val < 10000) { return `${val.toLocaleString()}원` }
  const man = val / 10000
  const rounded = Math.round(man * 10) / 10
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}만원`
}

/**
 * 별점을 소수점 1자리로 포맷
 */
export const formatRating = (val: number | null | undefined): string => {
  if (val == null) { return '-' }
  return val.toFixed(1)
}
