// Вид затрат — «услуга» нашей предметной области.
// Ответы веб-сервиса приводит к этому типу функция toCost, mock-объекты сразу описаны им.
export interface Cost {
  id: number
  cost_name: string
  short_description: string
  image_url: string
  video_url: string
  amount_monthly: number | null
  is_fixed: boolean | null
  creator_id: number
  created_at: string
  formed_at: string | null
  likes_count: number
  is_mine: boolean
  is_liked: boolean
}

export type CostKind = 'fixed' | 'variable'

// Фильтр страницы «Виды затрат»: вид затрат и диапазон суммы (цены)
export interface CostFilters {
  kinds: CostKind[] // пустой массив = все виды
  minAmount: number
  maxAmount: number
}

export const AMOUNT_MIN = 0
export const AMOUNT_MAX = 8_000_000
export const AMOUNT_STEP = 50_000

export const DEFAULT_FILTERS: CostFilters = {
  kinds: [],
  minAmount: AMOUNT_MIN,
  maxAmount: AMOUNT_MAX,
}
