import type { FC } from 'react'
import { Alert } from 'react-bootstrap'
import { useAppSelector } from '../../store/hooks'

// Сообщения о состоянии данных: ошибка запроса, истёкшая сессия, работа на mock.
// Mock бывает только у гостя, поэтому пользователю эта плашка не показывается.
export const StatusBanner: FC = () => {
  const { error, usingMock } = useAppSelector((state) => state.costs)
  const { isAuth, sessionExpired } = useAppSelector((state) => state.user)

  return (
    <>
      {error && <Alert variant="danger" className="statusBanner">{error}</Alert>}
      {sessionExpired && !error && (
        <Alert variant="warning" className="statusBanner">Сессия истекла. Войдите снова.</Alert>
      )}
      {usingMock && !isAuth && !error && (
        <Alert variant="info" className="statusBanner">Сервис недоступен — показаны демонстрационные данные</Alert>
      )}
    </>
  )
}
