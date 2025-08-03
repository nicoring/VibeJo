import type { CardType } from '../types/game'

interface CardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  isClickable?: boolean;
}

function Card({ card, size = 'medium', onClick, isClickable = false }: CardProps) {
  const sizeClasses = {
    small: 'card-small',
    medium: 'card-medium',
    large: 'card-large'
  }

  const getCardColor = (value: number) => {
    if (value <= -1) return 'card-dark-blue'
    if (value === 0) return 'card-light-blue'
    if (value >= 1 && value <= 4) return 'card-green'
    if (value >= 5 && value <= 8) return 'card-yellow'
    if (value >= 9) return 'card-red'
    return 'card-default'
  }

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick()
    }
  }

  // Don't render removed cards - they should be empty spaces
  if (card.isRemoved) {
    return (
      <div 
        className={`card ${sizeClasses[size]} card-removed`}
      >
        <div className="card-empty">
          {/* Empty space - no content */}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`card ${sizeClasses[size]} ${isClickable ? 'card-clickable' : ''}`}
      onClick={handleClick}
    >
      {card.isVisible ? (
        <div className={`card-front ${getCardColor(card.value)}`}>
          <span className="card-value">{card.value}</span>
        </div>
      ) : (
        <div className="card-back">
          <div className="card-pattern"></div>
        </div>
      )}
    </div>
  )
}

export default Card 