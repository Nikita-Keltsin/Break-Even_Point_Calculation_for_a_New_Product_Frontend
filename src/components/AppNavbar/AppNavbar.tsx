import './AppNavbar.css'
import type { FC, ReactNode } from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import type { RouteKeyType } from '../../Routes'

// Иконки — те же, что в нижней панели шаблонов ЛР1
const ICONS: Record<RouteKeyType, ReactNode> = {
  HOME: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11h14V9" />
      <path d="M10 20v-6h4v6" />
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
  FEED: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8h16v12H4z" />
      <path d="M2 4h20v4H2z" />
      <path d="M9 12h6" />
    </svg>
  ),
}

// Порядок вкладок навигационной панели (список базовых страниц)
const TABS: RouteKeyType[] = ['HOME', 'COSTS', 'FEED']

export const AppNavbar: FC = () => (
  // Navbar из React-Bootstrap, закреплён снизу узкой колонки — как таб-панель мобильного приложения.
  // Nav.Link рендерится как NavLink роутера: переход без перезагрузки страницы,
  // а класс active NavLink ставит сам по текущему адресу.
  <Navbar fixed="bottom" className="appNavbar">
    <Nav className="appNav">
      {TABS.map((key) => (
        <Nav.Link key={key} as={NavLink} to={ROUTES[key]} end={key === 'HOME'} className="appNavTab">
          {ICONS[key]}
          <span>{ROUTE_LABELS[key]}</span>
        </Nav.Link>
      ))}
    </Nav>
  </Navbar>
)
