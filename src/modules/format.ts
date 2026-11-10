import type { CostKind } from './types'

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export const formatAmount = (amount: number | null) =>
  amount === null ? '—' : `${rub.format(amount)} ₽`

export const KIND_LABELS: Record<CostKind, string> = {
  fixed: 'Постоянные',
  variable: 'Переменные',
}

// is_fixed равен null, пока вид затрат не опубликован
export const kindOf = (isFixed: boolean | null): CostKind | null =>
  isFixed === null ? null : isFixed ? 'fixed' : 'variable'

export const kindLabel = (isFixed: boolean | null) => {
  const kind = kindOf(isFixed)
  return kind ? KIND_LABELS[kind] : '—'
}
