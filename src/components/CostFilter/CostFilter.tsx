import './CostFilter.css'
import type { FC, FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import type { CostFilters, CostKind } from '../../modules/types'
import { AMOUNT_MAX, AMOUNT_MIN, AMOUNT_STEP } from '../../modules/types'
import { KIND_LABELS } from '../../modules/format'

interface Props {
  value: CostFilters // значения полей фильтра (живут в Redux)
  onChange: (filters: CostFilters) => void // родитель записывает новые значения полей в Redux
  onApply: () => void // родитель запрашивает список с текущим фильтром
  onReset: () => void
  loading?: boolean // пока идёт загрузка, кнопка «Применить» заблокирована
}

const KINDS: CostKind[] = ['fixed', 'variable']

// Компонент фильтрации: по виду затрат и диапазону суммы (цены).
// Своего состояния нет: значения полей хранятся в Redux, поэтому сохраняются
// при переходе между страницами. Список обновляется только по «Применить», как в форме ЛР1.
export const CostFilter: FC<Props> = ({ value, onChange, onApply, onReset, loading = false }) => {
  const toggleKind = (kind: CostKind) =>
    onChange({
      ...value,
      kinds: value.kinds.includes(kind) ? value.kinds.filter((k) => k !== kind) : [...value.kinds, kind],
    })

  // Ползунки не могут «перепрыгнуть» друг через друга
  const setMin = (amount: number) => onChange({ ...value, minAmount: Math.min(amount, value.maxAmount) })
  const setMax = (amount: number) => onChange({ ...value, maxAmount: Math.max(amount, value.minAmount) })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault() // SPA: без перезагрузки страницы
    onApply()
  }

  // Подсветка отрезка между ползунками, в процентах от шкалы
  const toPercent = (amount: number) => ((amount - AMOUNT_MIN) / (AMOUNT_MAX - AMOUNT_MIN)) * 100

  return (
    <Form className="costFilter" onSubmit={handleSubmit}>
      <div className="costFilterHead">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        <b>Фильтр</b>
        <button type="button" className="costFilterReset" onClick={onReset}>
          Сбросить
        </button>
      </div>

      <div className="costFilterKinds">
        {KINDS.map((kind) => (
          <Form.Check
            key={kind}
            inline
            type="checkbox"
            id={`kind-${kind}`}
            label={KIND_LABELS[kind]}
            checked={value.kinds.includes(kind)}
            onChange={() => toggleKind(kind)}
            className={value.kinds.includes(kind) ? 'on' : ''}
          />
        ))}
      </div>

      <div className="costFilterRangeLabels">
        <label>Сумма от, ₽<input type="number" min={AMOUNT_MIN} max={value.maxAmount} value={value.minAmount} onChange={(e) => setMin(Math.max(AMOUNT_MIN, Number(e.target.value)))} /></label>
        <label>Сумма до, ₽<input type="number" min={value.minAmount} max={AMOUNT_MAX} value={value.maxAmount} onChange={(e) => setMax(Math.min(AMOUNT_MAX, Number(e.target.value)))} /></label>
      </div>
      <div className="dualRange">
        <span className="dualRangeTrack" />
        <span
          className="dualRangeFill"
          style={{ left: `${toPercent(value.minAmount)}%`, right: `${100 - toPercent(value.maxAmount)}%` }}
        />
        <input
          type="range"
          aria-label="Ползунок минимальной суммы"
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={AMOUNT_STEP}
          value={value.minAmount}
          onChange={(event) => setMin(Number(event.target.value))}
        />
        <input
          type="range"
          aria-label="Ползунок максимальной суммы"
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={AMOUNT_STEP}
          value={value.maxAmount}
          onChange={(event) => setMax(Number(event.target.value))}
        />
      </div>

      <Button type="submit" className="costFilterApply" disabled={loading}>
        Применить
      </Button>
    </Form>
  )
}
