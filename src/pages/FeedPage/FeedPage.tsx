import './FeedPage.css'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs'
import { StatusBanner } from '../../components/StatusBanner/StatusBanner'
import { DEFAULT_IMAGE, DEFAULT_VIDEO } from '../../modules/media'
import { formatAmount, kindLabel } from '../../modules/format'
import { ROUTES } from '../../Routes'
import { fetchFeedCost, likeCost } from '../../store/costsSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

// Описание длиннее этого значения не помещается в две строки — появляется кнопка «Ещё»
const SHORT_TEXT_LENGTH = 80

// Лента — подробная карточка вида затрат во весь экран, как feed.html из ЛР1.
// /feed — первая опубликованная карточка, /feed/:id — карточка по id.
export const FeedPage: FC = () => {
  const { id } = useParams() // параметр :id из адреса (строка или undefined)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuth = useAppSelector((state) => state.user.isAuth)
  const cost = useAppSelector((state) => state.costs.feedCost)
  const feedStatus = useAppSelector((state) => state.costs.feedStatus)

  const [expanded, setExpanded] = useState(false) // «Ещё» / «Свернуть»
  const [failedVideo, setFailedVideo] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // При каждом изменении id в адресе загружаем нужную карточку.
  // При входе и выходе тоже: от авторизации зависит is_liked.
  useEffect(() => {
    setExpanded(false)
    const request = dispatch(fetchFeedCost({ id: id === undefined ? undefined : Number(id) }))
    return () => request.abort() // ушли на другую карточку раньше, чем пришёл ответ
  }, [dispatch, id, isAuth])

  // Надпись «Ссылка скопирована» сама исчезает; таймер очищается при размонтировании
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  // «Далее» — следующая карточка, в конце ленты первая
  const handleNext = async () => {
    if (!cost) return
    const result = await dispatch(fetchFeedCost({ id: cost.id, next: true })).unwrap().catch(() => null)
    if (result?.cost) navigate(`${ROUTES.FEED}/${result.cost.id}`)
  }

  const handleLike = () => {
    if (cost) dispatch(likeCost({ id: cost.id, like: !cost.is_liked }))
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

  if (feedStatus === 'ready' && !cost) {
    // Несуществующий или удалённый вид затрат — просматривать нельзя
    return (
      <div className="feedPage feedCenter feedEmpty">
        <div className="feedTop">
          <Breadcrumbs variant="dark" crumbs={[{ label: 'Не найдено' }]} />
          <StatusBanner />
        </div>
        <p>Вид затрат не найден или удалён</p>
        <Button variant="light" onClick={() => navigate(ROUTES.COSTS)}>К видам затрат</Button>
      </div>
    )
  }

  // Пока не пришла карточка из адреса, старую не показываем: экран закрывает анимация загрузки
  if (!cost || (id !== undefined && cost.id !== Number(id))) {
    return <div className="feedPage" />
  }

  // Видео по умолчанию: поле video_url пустое или файл недоступен (браузер вызвал onError)
  const videoSrc = cost.video_url && cost.video_url !== failedVideo ? cost.video_url : DEFAULT_VIDEO

  return (
    <div className="feedPage">
      <video
        key={cost.id}
        className="feedVideo"
        src={videoSrc}
        poster={cost.image_url || DEFAULT_IMAGE}
        onError={() => setFailedVideo(videoSrc)}
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
        <StatusBanner />
      </div>

      <div className="feedActions">
        {/* Гость лайк не ставит — только видит количество */}
        <div className="feedAction">
          <button type="button" className={`feedRound ${cost.is_liked ? 'liked' : ''}`} disabled={!isAuth}
            onClick={handleLike} title={isAuth ? undefined : 'Лайк доступен после входа'} aria-label="Лайк"
            aria-pressed={cost.is_liked}>
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
        <p className={`feedDesc ${expanded ? 'full' : ''}`}>{cost.short_description}</p>
        {cost.short_description.length > SHORT_TEXT_LENGTH && (
          <button type="button" className="feedMore" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Свернуть' : 'Ещё'}
          </button>
        )}
        <div className="feedChips">
          <div className="feedChip"><span>СУММА</span><b>{formatAmount(cost.amount_monthly)}/мес</b></div>
          <div className="feedChip"><span>ВИД ЗАТРАТ</span><b>{kindLabel(cost.is_fixed)}</b></div>
        </div>
      </div>
    </div>
  )
}
