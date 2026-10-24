// Константы маршрутов и подписи для navbar и breadcrumbs
export const ROUTES = {
  HOME: '/',
  COSTS: '/cost-types',
  FEED: '/feed',
} as const

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  HOME: 'Главная',
  COSTS: 'Виды затрат',
  FEED: 'Лента',
}
