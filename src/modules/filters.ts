import type { CostFilters, CostKind } from './types'
import { AMOUNT_MAX, AMOUNT_MIN, DEFAULT_FILTERS } from './types'

// Фильтр хранится в адресной строке (?name=&kind=&min=&max=), как GET-форма в ЛР1.
// Так он переживает переход в ленту и обратно — без Redux и без Context.

const toNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  return value !== null && value !== '' && Number.isFinite(parsed) ? parsed : fallback
}

export const filtersFromParams = (params: URLSearchParams): CostFilters => {
  const kinds = params
    .getAll('kind')
    .filter((kind): kind is CostKind => kind === 'fixed' || kind === 'variable')

  return {
    name: params.get('name') ?? DEFAULT_FILTERS.name,
    kinds,
    minAmount: toNumber(params.get('min'), AMOUNT_MIN),
    maxAmount: toNumber(params.get('max'), AMOUNT_MAX),
  }
}

export const filtersToParams = (filters: CostFilters): URLSearchParams => {
  const params = new URLSearchParams()
  if (filters.name.trim()) params.set('name', filters.name.trim())
  filters.kinds.forEach((kind) => params.append('kind', kind))
  if (filters.minAmount > AMOUNT_MIN) params.set('min', String(filters.minAmount))
  if (filters.maxAmount < AMOUNT_MAX) params.set('max', String(filters.maxAmount))
  return params
}
