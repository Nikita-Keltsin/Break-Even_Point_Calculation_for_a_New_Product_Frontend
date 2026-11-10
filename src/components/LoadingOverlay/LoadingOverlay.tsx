import './LoadingOverlay.css'
import type { FC } from 'react'
import { Spinner } from 'react-bootstrap'

// Анимация на время запроса: слой на весь экран, поверх навигационной панели, не пропускает клики
export const LoadingOverlay: FC = () => (
  <div className="loadingOverlay" role="status" aria-label="Загрузка">
    <Spinner animation="border" />
  </div>
)
