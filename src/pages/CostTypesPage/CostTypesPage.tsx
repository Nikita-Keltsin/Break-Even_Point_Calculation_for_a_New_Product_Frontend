import './CostTypesPage.css'
import { useCallback, useEffect, useRef } from 'react'
import type { FC } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { CartIcon } from '../../components/CartIcon/CartIcon'
import { CostCard } from '../../components/CostCard/CostCard'
import { CostFilter } from '../../components/CostFilter/CostFilter'
import { StatusBanner } from '../../components/StatusBanner/StatusBanner'
import type { CostFilters } from '../../modules/types'
import { ROUTES } from '../../Routes'
import { selectIsBusy } from '../../store'
import { deleteCost, fetchCosts, fetchDraft } from '../../store/costsSlice'
import { resetFilters, setFilters } from '../../store/filtersSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

// Страница списка «услуг» — плитка видов затрат с фильтрами (аналог cost_types.html из ЛР1)
export const CostTypesPage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)
  const isAuth = useAppSelector((state) => state.user.isAuth)
  const { list: costs, listStatus, draft, error } = useAppSelector((state) => state.costs)
  const busy = useAppSelector(selectIsBusy)

  // Последний запрос списка: ответ на устаревший фильтр не нужен, его отменяем
  const listRequest = useRef<{ abort: () => void } | null>(null)
  const loadCosts = useCallback(() => {
    listRequest.current?.abort()
    listRequest.current = dispatch(fetchCosts()) // thunk сам возьмёт фильтр из Redux
  }, [dispatch])

  // Список загружаем при открытии страницы и при входе или выходе (от авторизации зависит
  // признак is_mine, а значит и кнопки удаления). Изменение полей фильтра список не трогает:
  // он обновится по «Применить».
  useEffect(() => {
    loadCosts()
    return () => listRequest.current?.abort()
  }, [loadCosts, isAuth])

  // Черновик есть только у пользователя: от него зависит счётчик на корзине
  useEffect(() => {
    if (!isAuth) return
    const request = dispatch(fetchDraft())
    return () => request.abort()
  }, [dispatch, isAuth])

  // Колбэки, которые передаём в CostFilter через props
  const handleChange = (next: CostFilters) => dispatch(setFilters(next)) // значения полей -> Redux
  const handleApply = () => loadCosts()
  const handleReset = () => {
    dispatch(resetFilters())
    loadCosts()
  }

  // Колбэк для CostCard: переход в ленту на выбранную карточку
  const handleCardClick = (id: number) => navigate(`${ROUTES.FEED}/${id}`)

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить этот вид затрат?')) dispatch(deleteCost(id))
  }

  return (
    <div className="costTypesPage">
      <header className="pageHeader">
        <Breadcrumbs crumbs={[]} />
        <div className="pageHeaderRow">
          <h1 className="pageTitle">Виды затрат</h1>
          <CartIcon count={draft ? 1 : 0} disabled={!isAuth} onClick={() => navigate(ROUTES.ADDITION)} />
        </div>
      </header>

      <div className="costTypesBody">
        <StatusBanner />
        <CostFilter
          value={filters}
          onChange={handleChange}
          onApply={handleApply}
          onReset={handleReset}
          loading={busy}
        />

        {listStatus === 'ready' && costs.length === 0 && !error && (
          <div className="costTypesEmpty">Ничего не найдено. Измените фильтр.</div>
        )}
        {costs.length > 0 && (
          <>
            <div className="costTypesCount">Найдено: {costs.length}</div>
            <Row xs={2} className="g-3">
              {costs.map((cost) => (
                <Col key={cost.id}>
                  <CostCard
                    cost={cost}
                    onClick={handleCardClick}
                    onDelete={isAuth && cost.is_mine ? handleDelete : undefined}
                  />
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </div>
  )
}
