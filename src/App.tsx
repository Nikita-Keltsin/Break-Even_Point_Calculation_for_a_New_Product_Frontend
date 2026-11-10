import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from './Routes'
import { AdditionPage } from './pages/AdditionPage/AdditionPage'
import { CostTypesPage } from './pages/CostTypesPage/CostTypesPage'
import { FeedPage } from './pages/FeedPage/FeedPage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { useAppSelector } from './store/hooks'

function App() {
  const isAuth = useAppSelector((state) => state.user.isAuth)

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Вложенные маршруты: AppLayout оборачивает все страницы */}
        <Route element={<AppLayout />}>
          {/* Стартовая страница — плитка видов затрат */}
          <Route path="/" element={<Navigate to={ROUTES.COSTS} replace />} />
          <Route path={ROUTES.COSTS} element={<CostTypesPage />} />
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          {/* Гостю добавление недоступно, а уже вошедшему нечего делать на странице входа */}
          <Route path={ROUTES.ADDITION} element={isAuth ? <AdditionPage /> : <Navigate to={ROUTES.LOGIN} replace />} />
          <Route path={ROUTES.LOGIN} element={isAuth ? <Navigate to={ROUTES.COSTS} replace /> : <LoginPage />} />
          <Route path="*" element={<Navigate to={ROUTES.COSTS} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
