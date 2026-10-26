import './Breadcrumbs.css'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'

export interface Crumb {
  label: string
  path?: string // нет пути — пункт не кликабельный
}

interface Props {
  crumbs: Crumb[] // путь ПОСЛЕ базовой страницы; «Виды затрат» добавляется всегда первой
  variant?: 'light' | 'dark' // dark — светлый текст поверх видео в ленте
}

// Самописная навигационная цепочка: путь от базовой страницы (плитка «Виды затрат») к текущей.
// Все пункты, кроме последнего, — ссылки Link; последний — текущая страница (aria-current).
export const Breadcrumbs: FC<Props> = ({ crumbs, variant = 'light' }) => {
  const items: Crumb[] = [{ label: ROUTE_LABELS.COSTS, path: ROUTES.COSTS }, ...crumbs]

  return (
    <nav aria-label="Навигационная цепочка" className={`crumbs crumbs-${variant}`}>
      <ol>
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${crumb.label}-${index}`}>
              {isLast || !crumb.path ? (
                <span className="crumbs-current" aria-current={isLast ? 'page' : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
              {!isLast && <span className="crumbs-sep" aria-hidden="true">›</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
