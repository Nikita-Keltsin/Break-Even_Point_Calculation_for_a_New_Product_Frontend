import './CostTypesPage.css'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { CartIcon } from '../../components/CartIcon/CartIcon'
import { CostCard } from '../../components/CostCard/CostCard'
import { CostFilter } from '../../components/CostFilter/CostFilter'
import { StatusBanner } from '../../components/StatusBanner/StatusBanner'
import { DEFAULT_FILTERS, type CostFilters } from '../../modules/types'
import { ROUTES } from '../../Routes'
import { selectIsBusy } from '../../store'
import { deleteCost, fetchCosts, fetchDraft, PAGE_SIZE } from '../../store/costsSlice'
import { resetFilters, setFilters } from '../../store/filtersSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

// Страница списка — плитка видов затрат с фильтрами (аналог cost_types.html из ЛР1)
export const CostTypesPage: FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)
  const isAuth = useAppSelector((state) => state.user.isAuth)
  const { list: costs, total, listStatus, draft, error } = useAppSelector((state) => state.costs)
  const busy = useAppSelector(selectIsBusy)

  const [page, setPage] = useState(1)
  const [applied, setApplied] = useState(filters)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    const request = dispatch(fetchCosts({ page, filter: applied }))
    return () => request.abort()
  }, [applied, dispatch, isAuth, page])

  // Черновик есть только у пользователя: от него зависит счётчик на корзине
  useEffect(() => {
    if (!isAuth) return
    const request = dispatch(fetchDraft())
    return () => request.abort()
  }, [dispatch, isAuth])

  // Колбэки, которые передаём в CostFilter через props
  const handleChange = (next: CostFilters) => dispatch(setFilters(next)) // значения полей -> Redux
  const handleApply = () => {
    setPage(1)
    setApplied({ ...filters })
  }
  const handleReset = () => {
    dispatch(resetFilters())
    setPage(1)
    setApplied({ ...DEFAULT_FILTERS })
  }

  // Колбэк для CostCard: переход в ленту на выбранную карточку
  const handleCardClick = (id: number) => navigate(`${ROUTES.FEED}/${id}`)

  const handleDelete = (id: number) => {
    if (!window.confirm('Удалить этот вид затрат?')) return
    void dispatch(deleteCost(id)).unwrap().then(() => {
      if (costs.length === 1 && page > 1) setPage(page - 1)
      else setApplied((current) => ({ ...current }))
    }).catch(() => undefined)
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
            <div className="costTypesCount">Найдено: {total.toLocaleString('ru-RU')}</div>
            <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
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
            <nav className="catalogPagination" aria-label="Страницы каталога">
              <Button variant="outline-primary" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>Назад</Button>
              <span aria-live="polite">Страница {page} из {pages}</span>
              <Button variant="outline-primary" disabled={page >= pages || busy} onClick={() => setPage(page + 1)}>Вперёд</Button>
            </nav>
          </>
        )}
      </div>
    </div>
  )
}
