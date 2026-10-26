import './CostTypesPage.css'
import { useEffect, useMemo, useState } from 'react'
import type { FC } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { CartIcon } from '../../components/CartIcon/CartIcon'
import { CostCard } from '../../components/CostCard/CostCard'
import { CostFilter } from '../../components/CostFilter/CostFilter'
import { getCosts } from '../../modules/costsApi'
import { filtersFromParams, filtersToParams } from '../../modules/filters'
import type { Cost, CostFilters } from '../../modules/types'
import { ROUTES } from '../../Routes'

// Гость черновиков не имеет; после авторизации здесь будет число из GET /api/costs/draft
const GUEST_DRAFT_COUNT = 0

// Страница списка «услуг» — плитка видов затрат с фильтрами (аналог cost_types.html из ЛР1)
export const CostTypesPage: FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)

  // Применённый фильтр читаем из адресной строки. useMemo даёт один и тот же объект,
  // пока не изменился URL, — иначе useEffect ниже срабатывал бы на каждом рендере.
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams])

  // Загружаем список при монтировании и при каждом изменении фильтра
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCosts(filters).then((result) => {
      if (cancelled) return // пришёл ответ на устаревший фильтр — игнорируем
      setCosts(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [filters])

  // Колбэки, которые передаём в CostFilter через props
  const handleApply = (next: CostFilters) => setSearchParams(filtersToParams(next))
  const handleReset = () => setSearchParams({})

  // Колбэк для CostCard: переход в ленту на выбранную карточку
  const handleCardClick = (id: number) => navigate(`${ROUTES.FEED}/${id}`)

  return (
    <div className="costTypesPage">
      <header className="pageHeader">
        <Breadcrumbs crumbs={[]} />
        <div className="pageHeaderRow">
          <h1 className="pageTitle">Виды затрат</h1>
          <CartIcon count={GUEST_DRAFT_COUNT} disabled />
        </div>
      </header>

      <div className="costTypesBody">
        <CostFilter value={filters} onApply={handleApply} onReset={handleReset} loading={loading} />

        {loading ? (
          <div className="pageLoader"><Spinner animation="border" /></div>
        ) : costs.length === 0 ? (
          <div className="costTypesEmpty">Ничего не найдено. Измените фильтр.</div>
        ) : (
          <>
            <div className="costTypesCount">Найдено: {costs.length}</div>
            <Row xs={2} className="g-3">
              {costs.map((cost) => (
                <Col key={cost.id}>
                  <CostCard cost={cost} onClick={handleCardClick} />
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </div>
  )
}
