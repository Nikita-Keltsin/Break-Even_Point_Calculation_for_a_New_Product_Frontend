import type { Cost, CostFilters } from './types'
import { kindOf } from './format'
import { mockAsset } from './media'

// Коллекция mock-объектов — запасной ответ для гостя, когда веб-сервис недоступен.
// Данные взяты из migrations/002_seed.sql (только опубликованные) и дополнены двумя записями.
//
// Обложки лежат в public/mock и отдаются самим фронтендом.
// Изображение по умолчанию демонстрируют две записи:
//   id 5 — поле image_url пустое                    -> сразу DEFAULT_IMAGE;
//   id 7 — image_url указывает на несуществующий файл -> onError -> DEFAULT_IMAGE.
// video_url у mock пустой, поэтому в ленте играет видео по умолчанию.
export const COSTS_MOCK: Cost[] = [
  {
    id: 1,
    cost_name: 'Операционные расходы (OPEX)',
    short_description: 'Аренда офиса, коммунальные платежи, клининг и охрана. Не зависят от объёма выпуска.',
    image_url: mockAsset('opex.png'),
    video_url: '',
    amount_monthly: 2_850_000,
    is_fixed: true,
    creator_id: 1,
    created_at: '2026-09-01T10:00:00Z',
    formed_at: '2026-09-01T12:00:00Z',
    likes_count: 3,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 2,
    cost_name: 'Фонд оплаты труда (ФОТ)',
    short_description: 'Оклады, страховые взносы и ДМС управленческой команды; индексируются раз в год.',
    image_url: mockAsset('fot.png'),
    video_url: '',
    amount_monthly: 4_620_000,
    is_fixed: true,
    creator_id: 1,
    created_at: '2026-09-02T10:00:00Z',
    formed_at: '2026-09-02T12:00:00Z',
    likes_count: 1,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 3,
    cost_name: 'Себестоимость продаж (COGS)',
    short_description: 'Сырьё, упаковка, склад и доставка до РЦ; растут пропорционально объёму продаж.',
    image_url: mockAsset('cogs.png'),
    video_url: '',
    amount_monthly: 7_410_000,
    is_fixed: false,
    creator_id: 1,
    created_at: '2026-09-03T10:00:00Z',
    formed_at: '2026-09-03T12:00:00Z',
    likes_count: 1,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 5,
    cost_name: 'Логистика последней мили',
    short_description: 'Курьерские сервисы и компенсации возвратов; зависят от числа заказов.',
    image_url: '', // пустое поле -> изображение по умолчанию
    video_url: '',
    amount_monthly: 75_000,
    is_fixed: false,
    creator_id: 1,
    created_at: '2026-09-05T10:00:00Z',
    formed_at: '2026-09-05T12:00:00Z',
    likes_count: 0,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 6,
    cost_name: 'Амортизация оборудования (CAPEX)',
    short_description: 'Линейная амортизация производственной линии и серверов; срок использования 5 лет.',
    image_url: mockAsset('depr.png'),
    video_url: '',
    amount_monthly: 640_000,
    is_fixed: true,
    creator_id: 3,
    created_at: '2026-09-08T10:00:00Z',
    formed_at: '2026-09-08T12:00:00Z',
    likes_count: 2,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 7,
    cost_name: 'Комиссии эквайринга',
    short_description: 'Комиссия банка 1,8% от оборота по картам и СБП; растёт пропорционально выручке.',
    image_url: mockAsset('acquiring.png'), // такого файла нет -> onError -> по умолчанию
    video_url: '',
    amount_monthly: 310_000,
    is_fixed: false,
    creator_id: 3,
    created_at: '2026-09-10T10:00:00Z',
    formed_at: '2026-09-10T12:00:00Z',
    likes_count: 4,
    is_mine: false,
    is_liked: false,
  },
]

// То же, что делает GET /api/breakeven_point с параметрами min_amount, max_amount, is_fixed
export const getMockCosts = (filters: CostFilters): Cost[] =>
  COSTS_MOCK.filter((cost) => {
    const amount = cost.amount_monthly ?? 0
    const kind = kindOf(cost.is_fixed)
    if (filters.kinds.length && (!kind || !filters.kinds.includes(kind))) return false
    return amount >= filters.minAmount && amount <= filters.maxAmount
  })

// То же, что GET /api/breakeven_point/feed: без id — первая карточка, с id — эта карточка,
// с id и next — следующая после id, а в конце ленты снова первая
export const getMockFeedCost = (id?: number, next = false): Cost | null => {
  if (id === undefined) return COSTS_MOCK[0] ?? null
  if (next) return COSTS_MOCK.find((cost) => cost.id > id) ?? COSTS_MOCK[0] ?? null
  return COSTS_MOCK.find((cost) => cost.id === id) ?? null
}
