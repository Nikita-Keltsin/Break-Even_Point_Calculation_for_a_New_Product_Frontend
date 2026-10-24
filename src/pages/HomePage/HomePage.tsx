import './HomePage.css'
import { useEffect, useMemo, useState } from 'react'
import type { FC } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { getCosts } from '../../modules/costsApi'
import { DEFAULT_FILTERS } from '../../modules/types'
import type { Cost, CostKind } from '../../modules/types'
import { filtersToParams } from '../../modules/filters'
import { formatMillions, KIND_LABELS, pluralKinds } from '../../modules/format'
import { ROUTES } from '../../Routes'

// Главная (стартовая) страница: о системе, формула точки безубыточности и сводка по видам затрат
export const HomePage: FC = () => {
  const navigate = useNavigate()
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка один раз при монтировании (пустой массив зависимостей)
  useEffect(() => {
    let cancelled = false
    getCosts(DEFAULT_FILTERS).then((result) => {
      if (cancelled) return // компонент уже размонтирован — состояние не трогаем
      setCosts(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Итоги пересчитываются только при изменении costs, а не на каждом рендере
  const summary = useMemo(() => {
    const byKind = (kind: CostKind) => costs.filter((cost) => cost.cost_kind === kind)
    return (['fixed', 'variable'] as CostKind[]).map((kind) => ({
      kind,
      count: byKind(kind).length,
      total: byKind(kind).reduce((sum, cost) => sum + (cost.amount_monthly ?? 0), 0),
    }))
  }, [costs])

  const openCostsOfKind = (kind: CostKind) =>
    navigate(`${ROUTES.COSTS}?${filtersToParams({ ...DEFAULT_FILTERS, kinds: [kind] })}`)

  return (
    <div className="homePage">
      <Breadcrumbs crumbs={[]} />

      <section className="homeHero">
        <span className="homeEyebrow">Аудит · финансовая модель</span>
        <h1>Расчёт точки безубыточности нового продукта</h1>
        <p>
          Каталог видов затрат компании: постоянные и переменные расходы с нормативной суммой в месяц.
          Из них складывается объём продаж, при котором продукт выходит в ноль.
        </p>
      </section>

      <section className="homeFormula">
        <div className="homeFormulaMain">
          <span>Q<sub>б</sub></span> = <span className="frac"><span>FC</span><span>P − AVC</span></span>
        </div>
        <ul>
          <li><b>FC</b> — постоянные затраты, ₽/мес</li>
          <li><b>P</b> — цена единицы продукта, ₽</li>
          <li><b>AVC</b> — переменные затраты на единицу, ₽</li>
        </ul>
      </section>

      <section className="homeSummary">
        <h2>Сейчас в каталоге</h2>
        {loading ? (
          <div className="pageLoader"><Spinner animation="border" size="sm" /></div>
        ) : (
          <div className="homeTiles">
            {summary.map(({ kind, count, total }) => (
              <button key={kind} type="button" className={`homeTile ${kind}`} onClick={() => openCostsOfKind(kind)}>
                <span className="homeTileLabel">{KIND_LABELS[kind]}</span>
                <span className="homeTileValue">{formatMillions(total)}</span>
                <span className="homeTileNote">{pluralKinds(count)} · в месяц</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="homeActions">
        <Button onClick={() => navigate(ROUTES.COSTS)}>Смотреть виды затрат</Button>
        <Button variant="outline-primary" onClick={() => navigate(ROUTES.FEED)}>Открыть ленту</Button>
      </div>
    </div>
  )
}
