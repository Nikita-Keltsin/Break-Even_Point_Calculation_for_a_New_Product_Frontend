import type { Cost, CostFilters } from './types'
import { AMOUNT_MAX, AMOUNT_MIN } from './types'
import { COSTS_MOCK } from './mock'

// В ЛР5 содержимое карточек берётся только из mock-коллекции (бэкенд не нужен).
// Чтобы подключить веб-сервис, запустите фронтенд с VITE_USE_MOCK=false:
// запросы пойдут на /api/... через прокси Vite (vite.config.ts), а при ошибке сети
// снова подставятся mock-данные.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Небольшая задержка, чтобы mock вёл себя как сеть и был виден Spinner
const delay = <T>(value: T, ms = 300) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

// Та же фильтрация, что делает бэкенд в GET /api/costs (min_amount, max_amount, kind) + название
const filterMock = (filters: CostFilters): Cost[] => {
  const name = filters.name.trim().toLowerCase()
  return COSTS_MOCK.filter((cost) => {
    const amount = cost.amount_monthly ?? 0
    if (name && !cost.cost_name.toLowerCase().includes(name)) return false
    if (filters.kinds.length && (!cost.cost_kind || !filters.kinds.includes(cost.cost_kind))) return false
    return amount >= filters.minAmount && amount <= filters.maxAmount
  })
}

// GET /api/costs — список опубликованных видов затрат с фильтрацией
export const getCosts = async (filters: CostFilters): Promise<Cost[]> => {
  if (USE_MOCK) return delay(filterMock(filters))

  const params = new URLSearchParams()
  if (filters.name.trim()) params.set('name', filters.name.trim())
  if (filters.minAmount > AMOUNT_MIN) params.set('min_amount', String(filters.minAmount))
  if (filters.maxAmount < AMOUNT_MAX) params.set('max_amount', String(filters.maxAmount))
  if (filters.kinds.length === 1) params.set('kind', filters.kinds[0])

  try {
    const response = await fetch(`/api/costs?${params}`)
    if (!response.ok) throw new Error(String(response.status))
    return (await response.json()) as Cost[]
  } catch {
    return filterMock(filters)
  }
}

// Лента по mock: без id — первая карточка; next=true — следующая после id, в конце заворот на первую
const feedMock = (id?: number, next = false): Cost | null => {
  if (!COSTS_MOCK.length) return null
  if (id === undefined) return COSTS_MOCK[0]
  if (next) {
    const index = COSTS_MOCK.findIndex((cost) => cost.id === id)
    return COSTS_MOCK[(index + 1) % COSTS_MOCK.length]
  }
  return COSTS_MOCK.find((cost) => cost.id === id) ?? null // удалённую/несуществующую не показываем
}

// GET /api/costs/feed, /api/costs/feed/:id и /api/costs/feed/:id?next=true
export const getFeedCost = async (id?: number, next = false): Promise<Cost | null> => {
  if (USE_MOCK) return delay(feedMock(id, next))

  const url = id === undefined ? '/api/costs/feed' : `/api/costs/feed/${id}${next ? '?next=true' : ''}`
  try {
    const response = await fetch(url)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(String(response.status))
    return (await response.json()) as Cost
  } catch {
    return feedMock(id, next)
  }
}
