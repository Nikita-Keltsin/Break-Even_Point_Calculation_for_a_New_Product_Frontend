import type { Cost } from './types'
import { mockAsset } from './media'

// Коллекция mock-объектов — имитация ответа GET /api/costs.
// Данные взяты из migrations/002_seed.sql (только опубликованные: удалённые и черновики
// веб-сервис гостю не отдаёт) и дополнены двумя записями для демонстрации фильтров.
//
// Без БД и S3: обложки лежат в public/mock и отдаются самим фронтендом.
// Изображение по умолчанию демонстрируют две записи:
//   id 5 — поле image_url пустое                    -> сразу DEFAULT_IMAGE;
//   id 7 — image_url указывает на несуществующий файл -> onError -> DEFAULT_IMAGE.
// video_url у mock пустой, поэтому в ленте играет видео по умолчанию.
export const COSTS_MOCK: Cost[] = [
  {
    id: 1,
    cost_name: 'Операционные расходы (OPEX)',
    short_description: 'Постоянные расходы недвижимости и офиса',
    full_description:
      'Аренда переговорных и представительского офиса, коммунальные платежи, клининг и охрана; регламент пересмотра ставок ежеквартальный.',
    image_key: 'screen.png',
    video_key: '',
    amount_monthly: 2_850_000,
    cost_kind: 'fixed',
    creator_id: 1,
    created_at: '2026-09-01T10:00:00Z',
    formed_at: '2026-09-01T12:00:00Z',
    image_url: mockAsset('opex.png'),
    video_url: '',
    likes_count: 3,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 2,
    cost_name: 'Фонд оплаты труда (ФОТ)',
    short_description: 'Оклады управленческой команды',
    full_description:
      'Оклады, страховые взносы и ДМС управленческой команды; не зависит от выручки, индексируется раз в год.',
    image_key: 'screen_2.png',
    video_key: '',
    amount_monthly: 4_620_000,
    cost_kind: 'fixed',
    creator_id: 1,
    created_at: '2026-09-02T10:00:00Z',
    formed_at: '2026-09-02T12:00:00Z',
    image_url: mockAsset('fot.png'),
    video_url: '',
    likes_count: 1,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 3,
    cost_name: 'Себестоимость продаж (COGS)',
    short_description: 'Переменные затраты производства',
    full_description:
      'Сырьё, упаковка, склад и магистральная доставка до РЦ; норматив пересчитывается еженедельно.',
    image_key: 'screen_3.png',
    video_key: '',
    amount_monthly: 7_410_000,
    cost_kind: 'variable',
    creator_id: 1,
    created_at: '2026-09-03T10:00:00Z',
    formed_at: '2026-09-03T12:00:00Z',
    image_url: mockAsset('cogs.png'),
    video_url: '',
    likes_count: 1,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 5,
    cost_name: 'Логистика последней мили',
    short_description: 'Переменные расходы доставки',
    full_description:
      'Курьерские сервисы, эквайринг доставки, компенсации возвратов; планируются от числа заказов.',
    image_key: '',
    video_key: '',
    amount_monthly: 75_000,
    cost_kind: 'variable',
    creator_id: 1,
    created_at: '2026-09-05T10:00:00Z',
    formed_at: '2026-09-05T12:00:00Z',
    image_url: '', // пустое поле -> изображение по умолчанию
    video_url: '',
    likes_count: 0,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 6,
    cost_name: 'Амортизация оборудования (CAPEX)',
    short_description: 'Постоянные начисления по основным средствам',
    full_description:
      'Линейная амортизация производственной линии и серверного оборудования; срок полезного использования 5 лет, начисляется ежемесячно.',
    image_key: 'depr.png',
    video_key: '',
    amount_monthly: 640_000,
    cost_kind: 'fixed',
    creator_id: 3,
    created_at: '2026-09-08T10:00:00Z',
    formed_at: '2026-09-08T12:00:00Z',
    image_url: mockAsset('depr.png'),
    video_url: '',
    likes_count: 2,
    is_mine: false,
    is_liked: false,
  },
  {
    id: 7,
    cost_name: 'Комиссии эквайринга',
    short_description: 'Процент банка с каждой оплаты',
    full_description:
      'Комиссия банка-эквайера 1,8% от оборота по картам и СБП; растёт пропорционально выручке, пересматривается при смене тарифа.',
    image_key: 'acquiring.png',
    video_key: '',
    amount_monthly: 310_000,
    cost_kind: 'variable',
    creator_id: 3,
    created_at: '2026-09-10T10:00:00Z',
    formed_at: '2026-09-10T12:00:00Z',
    image_url: mockAsset('acquiring.png'), // такого файла нет -> onError -> по умолчанию
    video_url: '',
    likes_count: 4,
    is_mine: false,
    is_liked: false,
  },
]
