import type { CostKind } from './types'

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export const formatAmount = (amount: number | null) =>
  amount === null ? '—' : `${rub.format(amount)} ₽`

// Короткая запись для итогов: 7 470 000 -> «7,47 млн ₽»
export const formatMillions = (amount: number) =>
  `${(amount / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} млн ₽`

// 1 вид, 3 вида, 5 видов
export const pluralKinds = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} вид`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} вида`
  return `${count} видов`
}

export const KIND_LABELS: Record<CostKind, string> = {
  fixed: 'Постоянные',
  variable: 'Переменные',
}

export const kindLabel = (kind: CostKind | null) => (kind ? KIND_LABELS[kind] : '—')
