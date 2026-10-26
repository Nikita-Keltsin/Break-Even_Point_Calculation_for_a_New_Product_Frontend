import type { Cost, CostFilters } from './types'
import { COSTS_MOCK } from './mock'

// В ЛР5 всё работает только на mock-коллекции: без бэкенда, БД и S3 (MinIO).
// Функции асинхронные, как будущие запросы к веб-сервису, — в следующих ЛР
// внутри них появится fetch('/api/...'), а страницы менять не придётся.

// Небольшая задержка, чтобы mock вёл себя как сеть и был виден Spinner
const delay = <T>(value: T, ms = 300) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

// Список видов затрат с фильтрацией по названию, виду и диапазону суммы
// (те же параметры, что у GET /api/costs: min_amount, max_amount, kind)
export const getCosts = async (filters: CostFilters): Promise<Cost[]> => {
  const name = filters.name.trim().toLowerCase()
  const result = COSTS_MOCK.filter((cost) => {
    const amount = cost.amount_monthly ?? 0
    if (name && !cost.cost_name.toLowerCase().includes(name)) return false
    if (filters.kinds.length && (!cost.cost_kind || !filters.kinds.includes(cost.cost_kind))) return false
    return amount >= filters.minAmount && amount <= filters.maxAmount
  })
  return delay(result)
}

// Лента: без id — первая карточка; по id — эта карточка;
// next=true — следующая после id, в конце ленты заворот на первую
export const getFeedCost = async (id?: number, next = false): Promise<Cost | null> => {
  if (!COSTS_MOCK.length) return delay(null)
  if (id === undefined) return delay(COSTS_MOCK[0])
  if (next) {
    const index = COSTS_MOCK.findIndex((cost) => cost.id === id)
    return delay(COSTS_MOCK[(index + 1) % COSTS_MOCK.length])
  }
  // удалённую или несуществующую карточку не показываем
  return delay(COSTS_MOCK.find((cost) => cost.id === id) ?? null)
}
