// Константы маршрутов и подписи для navbar и breadcrumbs.
export const ROUTES = {
  FEED: '/feed',
  ADDITION: '/addition',
  COSTS: '/cost-types',
  LOGIN: '/login',
} as const

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  FEED: 'Лента',
  ADDITION: 'Добавление',
  COSTS: 'Виды затрат',
  LOGIN: 'Вход',
}

// После входа на месте пункта «Вход» показывается кнопка «Выход»
export const LOGOUT_LABEL = 'Выход'
