import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { AppNavbar } from './components/AppNavbar/AppNavbar'

// Общая оболочка всех страниц: узкая колонка телефона + навигационная панель.
// Outlet — место, куда роутер подставляет текущую страницу.
export const AppLayout: FC = () => (
  <div className="appShell">
    <main className="appContent">
      <Outlet />
    </main>
    <AppNavbar />
  </div>
)
