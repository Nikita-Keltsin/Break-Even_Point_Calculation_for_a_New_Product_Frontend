import './CartIcon.css'
import type { FC } from 'react'
import { Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

interface Props {
  count: number // сколько видов затрат в черновике текущего пользователя
  disabled?: boolean // для гостя корзина неактивна
  onClick?: () => void
}

// Иконка корзины. В нашей предметной области «корзина» — это черновик вида затрат
// (у пользователя не более одного). Гость черновика иметь не может, поэтому иконка
// показывается неактивной с подсказкой — станет рабочей после авторизации.
export const CartIcon: FC<Props> = ({ count, disabled = false, onClick }) => (
  <OverlayTrigger
    placement="bottom"
    overlay={
      <Tooltip id="cart-tooltip">
        {disabled ? 'Черновик доступен после входа' : 'Мой черновик'}
      </Tooltip>
    }
  >
    {/* обёртка нужна, чтобы подсказка работала и у disabled-кнопки */}
    <span className="cartWrap">
      <Button
        variant="light"
        className="cartBtn"
        disabled={disabled}
        onClick={onClick}
        aria-label="Корзина: черновик вида затрат"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.1" />
          <circle cx="9.5" cy="19.5" r="1.4" />
          <circle cx="17" cy="19.5" r="1.4" />
        </svg>
        {count > 0 && (
          <Badge pill bg="danger" className="cartBadge">
            {count}
          </Badge>
        )}
      </Button>
    </span>
  </OverlayTrigger>
)
