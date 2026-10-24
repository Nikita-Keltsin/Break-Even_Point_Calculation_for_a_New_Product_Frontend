import './CostCard.css'
import { useState } from 'react'
import type { FC } from 'react'
import { Card } from 'react-bootstrap'
import type { Cost } from '../../modules/types'
import { DEFAULT_IMAGE } from '../../modules/media'
import { formatAmount, kindLabel } from '../../modules/format'

interface Props {
  cost: Cost
  onClick: (id: number) => void // родитель решает, куда переходить по клику
}

export const CostCard: FC<Props> = ({ cost, onClick }) => {
  // Изображение по умолчанию, случай 1: поле image_url пустое -> сразу DEFAULT_IMAGE
  const [imageSrc, setImageSrc] = useState(cost.image_url || DEFAULT_IMAGE)

  // Случай 2: ссылка есть, но файл недоступен -> браузер вызывает onError -> подставляем DEFAULT_IMAGE.
  // Повторный set того же значения не вызывает ререндер, поэтому зацикливания нет.
  const handleImageError = () => setImageSrc(DEFAULT_IMAGE)

  return (
    <Card className="costCard" role="button" tabIndex={0} onClick={() => onClick(cost.id)}
      onKeyDown={(event) => event.key === 'Enter' && onClick(cost.id)}>
      <Card.Img variant="top" className="costCardImage" src={imageSrc} alt={cost.cost_name} onError={handleImageError} />
      <Card.Body className="costCardBody">
        <Card.Title className="costCardTitle">{cost.cost_name}</Card.Title>
        <div className="costCardSum">{formatAmount(cost.amount_monthly)}</div>
        <div className="costCardBadge">
          <span className={`costCardDot ${cost.cost_kind ?? ''}`} />
          <span className="costCardKind">{kindLabel(cost.cost_kind)}</span>
          <span className="costCardLikes">♥ {cost.likes_count}</span>
        </div>
      </Card.Body>
    </Card>
  )
}
