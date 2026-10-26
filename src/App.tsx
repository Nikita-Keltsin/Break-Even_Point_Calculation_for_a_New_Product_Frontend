import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ROUTES } from './Routes'
import { CostTypesPage } from './pages/CostTypesPage/CostTypesPage'
import { FeedPage } from './pages/FeedPage/FeedPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Вложенные маршруты: AppLayout оборачивает обе страницы */}
        <Route element={<AppLayout />}>
          {/* Стартовая страница — плитка видов затрат */}
          <Route path="/" element={<Navigate to={ROUTES.COSTS} replace />} />
          <Route path={ROUTES.COSTS} element={<CostTypesPage />} />
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path="*" element={<Navigate to={ROUTES.COSTS} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
