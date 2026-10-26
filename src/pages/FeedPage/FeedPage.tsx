import './FeedPage.css'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { getFeedCost } from '../../modules/costsApi'
import { DEFAULT_IMAGE, DEFAULT_VIDEO } from '../../modules/media'
import { formatAmount, kindLabel } from '../../modules/format'
import type { Cost } from '../../modules/types'
import { ROUTES } from '../../Routes'

// Лента — подробная карточка вида затрат во весь экран, как feed.html из ЛР1.
// /feed — первая опубликованная карточка, /feed/:id — карточка по id.
export const FeedPage: FC = () => {
  const { id } = useParams() // параметр :id из адреса (строка или undefined)
  const navigate = useNavigate()

  const [cost, setCost] = useState<Cost | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false) // «Ещё» / «Свернуть»
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO)
  const [copied, setCopied] = useState(false)

  // При каждом изменении id в адресе загружаем нужную карточку
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setExpanded(false)
    getFeedCost(id === undefined ? undefined : Number(id)).then((data) => {
      if (cancelled) return
      setCost(data)
      // Видео по умолчанию: пустое поле -> сразу DEFAULT_VIDEO, битая ссылка -> onError ниже
      setVideoSrc(data?.video_url || DEFAULT_VIDEO)
      setLoading(false)
    })
    return () => {
      cancelled = true // ушли на другую карточку раньше, чем пришёл ответ
    }
  }, [id])

  // Надпись «Ссылка скопирована» сама исчезает; таймер очищается при размонтировании
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  // «Далее» — как GET /api/costs/feed/:id?next=true: следующая карточка, в конце ленты — первая
  const handleNext = async () => {
    if (!cost) return
    const next = await getFeedCost(cost.id, true)
    if (next) navigate(`${ROUTES.FEED}/${next.id}`)
  }

  const handleShare = async () => {
    if (!cost) return
    const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}${ROUTES.FEED}/${cost.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Скопируйте ссылку', url)
    }
  }

  if (loading) {
    return (
      <div className="feedPage feedCenter">
        <Spinner animation="border" variant="light" />
      </div>
    )
  }

  if (!cost) {
    // Несуществующий или удалённый вид затрат — просматривать нельзя
    return (
      <div className="feedPage feedCenter feedEmpty">
        <div className="feedTop"><Breadcrumbs variant="dark" crumbs={[{ label: 'Не найдено' }]} /></div>
        <p>Вид затрат не найден или удалён</p>
        <Button variant="light" onClick={() => navigate(ROUTES.COSTS)}>К видам затрат</Button>
      </div>
    )
  }

  return (
    <div className="feedPage">
      <video
        key={cost.id}
        className="feedVideo"
        src={videoSrc}
        poster={cost.image_url || DEFAULT_IMAGE}
        onError={() => setVideoSrc(DEFAULT_VIDEO)}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="feedTop">
        <Breadcrumbs
          variant="dark"
          crumbs={[{ label: cost.cost_name }]}
        />
      </div>

      <div className="feedActions">
        {/* Гость лайк не ставит — только видит количество (лайк доступен после авторизации) */}
        <div className="feedAction">
          <button type="button" className={`feedRound ${cost.is_liked ? 'liked' : ''}`} disabled
            title="Лайк доступен после входа" aria-label="Лайк">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.5-9-9c-1.2-2.8.6-6 3.8-6 2 0 3.4 1.2 5.2 3.4C13.8 6.2 15.2 5 17.2 5c3.2 0 5 3.2 3.8 6-2 4.5-9 9-9 9z" /></svg>
          </button>
          <span className="feedRoundLabel">{cost.likes_count}</span>
        </div>
        <div className="feedAction">
          <button type="button" className="feedRound" onClick={handleShare} aria-label="Поделиться">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="M8.2 10.8l6.6-3.6M8.2 13.2l6.6 3.6" /></svg>
          </button>
          <span className="feedRoundLabel">{copied ? 'СКОПИРОВАНО' : 'ПОДЕЛИТЬСЯ'}</span>
        </div>
        <div className="feedAction">
          <button type="button" className="feedRound" onClick={handleNext} aria-label="Следующий вид затрат">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </button>
          <span className="feedRoundLabel">ДАЛЕЕ</span>
        </div>
      </div>

      <div className="feedOverlay">
        <h1 className="feedTitle">{cost.cost_name}</h1>
        <p className={`feedDesc ${expanded ? 'full' : ''}`}>
          {expanded ? cost.full_description || cost.short_description : cost.short_description}
        </p>
        {cost.full_description && (
          <button type="button" className="feedMore" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Свернуть' : 'Ещё'}
          </button>
        )}
        <div className="feedChips">
          <div className="feedChip"><span>СУММА</span><b>{formatAmount(cost.amount_monthly)}/мес</b></div>
          <div className="feedChip"><span>ВИД ЗАТРАТ</span><b>{kindLabel(cost.cost_kind)}</b></div>
        </div>
      </div>
    </div>
  )
}
