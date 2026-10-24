import './CostFilter.css'
import { useEffect, useState } from 'react'
import type { FC, FormEvent } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import type { CostFilters, CostKind } from '../../modules/types'
import { AMOUNT_MAX, AMOUNT_MIN, AMOUNT_STEP } from '../../modules/types'
import { formatAmount, KIND_LABELS } from '../../modules/format'

interface Props {
  value: CostFilters // применённый фильтр (живёт в URL у родителя)
  onApply: (filters: CostFilters) => void // родитель записывает фильтр в URL -> перезагружает список
  onReset: () => void
  loading?: boolean // пока идёт загрузка, кнопка «Применить» заблокирована
}

const KINDS: CostKind[] = ['fixed', 'variable']

// Компонент фильтрации: по названию, виду затрат и диапазону суммы (цены).
// Внутри — черновик фильтра (draft): пользователь двигает ползунки и печатает,
// а список обновится только по «Применить» / Enter, как в форме ЛР1.
export const CostFilter: FC<Props> = ({ value, onApply, onReset, loading = false }) => {
  const [draft, setDraft] = useState<CostFilters>(value)

  // Если применённый фильтр изменился снаружи (Сбросить, кнопка «Назад» браузера),
  // синхронизируем с ним черновик
  useEffect(() => {
    setDraft(value)
  }, [value])

  const toggleKind = (kind: CostKind) =>
    setDraft((prev) => ({
      ...prev,
      kinds: prev.kinds.includes(kind) ? prev.kinds.filter((k) => k !== kind) : [...prev.kinds, kind],
    }))

  // Ползунки не могут «перепрыгнуть» друг через друга
  const setMin = (amount: number) => setDraft((prev) => ({ ...prev, minAmount: Math.min(amount, prev.maxAmount) }))
  const setMax = (amount: number) => setDraft((prev) => ({ ...prev, maxAmount: Math.max(amount, prev.minAmount) }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault() // SPA: без перезагрузки страницы
    onApply(draft)
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

      <InputGroup className="costFilterSearch">
        <InputGroup.Text>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </InputGroup.Text>
        <Form.Control
          type="search"
          placeholder="Название вида затрат"
          aria-label="Поиск по названию"
          value={draft.name}
          onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
        />
      </InputGroup>

      <div className="costFilterKinds">
        {KINDS.map((kind) => (
          <Form.Check
            key={kind}
            inline
            type="checkbox"
            id={`kind-${kind}`}
            label={KIND_LABELS[kind]}
            checked={draft.kinds.includes(kind)}
            onChange={() => toggleKind(kind)}
            className={draft.kinds.includes(kind) ? 'on' : ''}
          />
        ))}
      </div>

      <div className="costFilterRangeLabels">
        <span>От: {formatAmount(draft.minAmount)}</span>
        <span>До: {formatAmount(draft.maxAmount)}</span>
      </div>
      <div className="dualRange">
        <span className="dualRangeTrack" />
        <span
          className="dualRangeFill"
          style={{ left: `${toPercent(draft.minAmount)}%`, right: `${100 - toPercent(draft.maxAmount)}%` }}
        />
        <input
          type="range"
          aria-label="Сумма от"
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={AMOUNT_STEP}
          value={draft.minAmount}
          onChange={(event) => setMin(Number(event.target.value))}
        />
        <input
          type="range"
          aria-label="Сумма до"
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={AMOUNT_STEP}
          value={draft.maxAmount}
          onChange={(event) => setMax(Number(event.target.value))}
        />
      </div>

      <Button type="submit" className="costFilterApply" disabled={loading}>
        Применить
      </Button>
    </Form>
  )
}
