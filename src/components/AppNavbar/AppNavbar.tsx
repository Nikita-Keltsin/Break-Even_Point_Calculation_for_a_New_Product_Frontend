import './AppNavbar.css'
import type { FC, ReactNode } from 'react'
import { Nav, Navbar, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { DISABLED_ROUTES, ROUTES, ROUTE_LABELS } from '../../Routes'
import type { RouteKeyType } from '../../Routes'

// Иконки — те же, что в нижней панели шаблонов ЛР1, плюс «Войти»
const ICONS: Record<RouteKeyType, ReactNode> = {
  FEED: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8h16v12H4z" />
      <path d="M2 4h20v4H2z" />
      <path d="M9 12h6" />
    </svg>
  ),
  ADDITION: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  COSTS: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),
  LOGIN: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16l4-4-4-4" />
      <path d="M14 12H4" />
    </svg>
  ),
}

// Порядок пунктов меню, как в ЛР1, и «Войти» справа
const TABS: RouteKeyType[] = ['FEED', 'ADDITION', 'COSTS', 'LOGIN']

export const AppNavbar: FC = () => (
  // Navbar из React-Bootstrap, закреплён снизу узкой колонки — как таб-панель мобильного приложения.
  // Активные пункты — NavLink роутера: переход без перезагрузки, класс active ставится по адресу.
  // Неактивные пункты (Добавление, Войти) рендерятся с disabled и подсказкой.
  <Navbar fixed="bottom" className="appNavbar">
    <Nav className="appNav">
      {TABS.map((key) =>
        DISABLED_ROUTES.includes(key) ? (
          <OverlayTrigger
            key={key}
            placement="top"
            overlay={<Tooltip id={`tip-${key}`}>Будет доступно в следующих ЛР</Tooltip>}
          >
            {/* обёртка нужна, чтобы подсказка показывалась у disabled-пункта */}
            <span className="appNavTabWrap">
              <Nav.Link disabled className="appNavTab" aria-disabled="true">
                {ICONS[key]}
                <span>{ROUTE_LABELS[key]}</span>
              </Nav.Link>
            </span>
          </OverlayTrigger>
        ) : (
          <Nav.Link key={key} as={NavLink} to={ROUTES[key]} className="appNavTab">
            {ICONS[key]}
            <span>{ROUTE_LABELS[key]}</span>
          </Nav.Link>
        ),
      )}
    </Nav>
  </Navbar>
)
