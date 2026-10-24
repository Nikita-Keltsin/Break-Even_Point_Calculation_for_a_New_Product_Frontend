// Вид затрат — «услуга» нашей предметной области.
// Поля совпадают с CostJSON из сериализатора веб-сервиса (internal/api/serializers.go),
// поэтому mock-объекты и ответ GET /api/costs взаимозаменяемы.
export type CostKind = 'fixed' | 'variable'

export interface Cost {
  id: number
  cost_name: string
  short_description: string
  full_description: string
  image_key: string
  video_key: string
  amount_monthly: number | null
  cost_kind: CostKind | null
  creator_id: number
  created_at: string
  formed_at: string | null
  image_url: string
  video_url: string
  likes_count: number
  is_mine: boolean
  is_liked: boolean
}

// Фильтр страницы «Виды затрат»: название, вид затрат и диапазон суммы (цены)
export interface CostFilters {
  name: string
  kinds: CostKind[] // пустой массив = все виды
  minAmount: number
  maxAmount: number
}

export const AMOUNT_MIN = 0
export const AMOUNT_MAX = 8_000_000
export const AMOUNT_STEP = 50_000

export const DEFAULT_FILTERS: CostFilters = {
  name: '',
  kinds: [],
  minAmount: AMOUNT_MIN,
  maxAmount: AMOUNT_MAX,
}
