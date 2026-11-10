import './AppNavbar.css'
import type { FC, ReactNode } from 'react'
import { Nav, Navbar, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { forgetToken, getToken } from '../../modules/authApi'
import { LOGOUT_LABEL, ROUTES, ROUTE_LABELS } from '../../Routes'
import type { RouteKeyType } from '../../Routes'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearUser, setAuthPending } from '../../store/userSlice'

// Иконки — те же, что в нижней панели шаблонов ЛР1, плюс «Вход» и «Выход»
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

const LOGOUT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M16 16l4-4-4-4" />
    <path d="M20 12H10" />
  </svg>
)

// Порядок пунктов меню, как в ЛР1; «Вход» или «Выход» справа
const TABS: RouteKeyType[] = ['FEED', 'ADDITION', 'COSTS']

export const AppNavbar: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector((state) => state.user.isAuth)

  // Деавторизация: axios прямо в компоненте, результат передаём в Redux вручную.
  // Фильтр сбрасывается по clearUser.
  const handleLogout = async () => {
    dispatch(setAuthPending(true))
    try {
      // POST /api/users/logout — бэкенд отзывает JWT (blacklist в Redis)
      await axios.post('/api/users/logout', null, { headers: { Authorization: `Bearer ${getToken()}` } })
    } catch {
      // Сервис недоступен или токен уже истёк: выйти из интерфейса всё равно должно получиться
    }
    forgetToken()
    dispatch(clearUser())
    dispatch(setAuthPending(false))
    navigate(ROUTES.COSTS)
  }

  return (
    // Navbar из React-Bootstrap, закреплён снизу узкой колонки — как таб-панель мобильного приложения.
    // Активные пункты — NavLink роутера: переход без перезагрузки, класс active ставится по адресу.
    <Navbar fixed="bottom" className="appNavbar">
      <Nav className="appNav">
        {TABS.map((key) =>
          key === 'ADDITION' && !isAuth ? (
            <OverlayTrigger
              key={key}
              placement="top"
              overlay={<Tooltip id={`tip-${key}`}>Доступно после входа</Tooltip>}
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
        {isAuth ? (
          <Nav.Link as="button" type="button" className="appNavTab" onClick={handleLogout}>
            {LOGOUT_ICON}
            <span>{LOGOUT_LABEL}</span>
          </Nav.Link>
        ) : (
          <Nav.Link as={NavLink} to={ROUTES.LOGIN} className="appNavTab">
            {ICONS.LOGIN}
            <span>{ROUTE_LABELS.LOGIN}</span>
          </Nav.Link>
        )}
      </Nav>
    </Navbar>
  )
}
