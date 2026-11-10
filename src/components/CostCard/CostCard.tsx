import './CostCard.css'
import { useState } from 'react'
import type { FC, MouseEvent } from 'react'
import { Button, Card } from 'react-bootstrap'
import type { Cost } from '../../modules/types'
import { DEFAULT_IMAGE } from '../../modules/media'
import { formatAmount, kindLabel, kindOf } from '../../modules/format'

interface Props {
  cost: Cost
  onClick: (id: number) => void // родитель решает, куда переходить по клику
  onDelete?: (id: number) => void // передаётся только для своих карточек пользователя
}

export const CostCard: FC<Props> = ({ cost, onClick, onDelete }) => {
  // Адрес, который не удалось загрузить. Источник вычисляем при рендере, а не храним:
  // если адрес изменится (mock сменился данными сервиса), новая картинка подхватится сама.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  // Изображение по умолчанию: поле image_url пустое или файл недоступен (браузер вызвал onError)
  const imageSrc = cost.image_url && cost.image_url !== failedSrc ? cost.image_url : DEFAULT_IMAGE

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation() // клик по кнопке не должен открывать ленту
    onDelete?.(cost.id)
  }

  return (
    <Card className="costCard" role="button" tabIndex={0} onClick={() => onClick(cost.id)}
      onKeyDown={(event) => event.key === 'Enter' && event.target === event.currentTarget && onClick(cost.id)}>
      <Card.Img variant="top" className="costCardImage" src={imageSrc} alt={cost.cost_name}
        onError={() => setFailedSrc(imageSrc)} />
      <Card.Body className="costCardBody">
        <Card.Title className="costCardTitle">{cost.cost_name}</Card.Title>
        <div className="costCardSum">{formatAmount(cost.amount_monthly)}</div>
        <div className="costCardBadge">
          <span className={`costCardDot ${kindOf(cost.is_fixed) ?? ''}`} />
          <span className="costCardKind">{kindLabel(cost.is_fixed)}</span>
          <span className="costCardLikes">♥ {cost.likes_count}</span>
        </div>
        {onDelete && (
          <Button variant="outline-danger" size="sm" className="costCardDelete" onClick={handleDelete}>
            Удалить
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
