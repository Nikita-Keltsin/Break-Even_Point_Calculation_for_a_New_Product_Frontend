import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { AppNavbar } from './components/AppNavbar/AppNavbar'
import { LoadingOverlay } from './components/LoadingOverlay/LoadingOverlay'
import { selectIsBusy } from './store'
import { useAppSelector } from './store/hooks'

// Общая оболочка всех страниц: узкая колонка телефона + навигационная панель.
// Outlet — место, куда роутер подставляет текущую страницу.
// Пока идёт запрос, анимация перекрывает экран от мыши, а inert блокирует ещё и клавиатуру.
export const AppLayout: FC = () => {
  const busy = useAppSelector(selectIsBusy)

  return (
    <>
      <div className="appShell" inert={busy}>
        <main className="appContent">
          <Outlet />
        </main>
        <AppNavbar />
      </div>
      {busy && <LoadingOverlay />}
    </>
  )
}
