import type { CostKind } from './types'

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export const formatAmount = (amount: number | null) =>
  amount === null ? '—' : `${rub.format(amount)} ₽`

export const KIND_LABELS: Record<CostKind, string> = {
  fixed: 'Постоянные',
  variable: 'Переменные',
}

export const kindLabel = (kind: CostKind | null) => (kind ? KIND_LABELS[kind] : '—')
