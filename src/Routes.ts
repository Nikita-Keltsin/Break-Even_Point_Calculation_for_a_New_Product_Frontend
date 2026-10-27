// Константы маршрутов и подписи для navbar и breadcrumbs.
// В ЛР5 работают только две страницы — плитка видов затрат и лента.
// «Добавление» и «Вход» уже есть в меню, но пока неактивны (появятся в следующих ЛР).
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

// Пункты меню, которые гость в ЛР5 открыть не может
export const DISABLED_ROUTES: RouteKeyType[] = ['ADDITION', 'LOGIN']
