import type { Player } from '../types/game'
import Card from './Card'

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  onCardClick?: (cardIndex: number) => void;
}

function PlayerBoard({ player, isCurrentPlayer, onCardClick }: PlayerBoardProps) {
  const handleCardClick = (index: number) => {
    const card = player.cards[index]
    // Don't allow clicking on removed cards
    if (onCardClick && !card.isRemoved) {
      onCardClick(index)
    }
  }

  return (
    <div className={`player-board ${isCurrentPlayer ? 'current-player' : ''}`}>
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        {isCurrentPlayer && <span className="current-player-badge">You</span>}
      </div>
      
      <div className="cards-grid">
        {player.cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            size={isCurrentPlayer ? 'medium' : 'small'}
            onClick={() => handleCardClick(index)}
            isClickable={isCurrentPlayer && !card.isRemoved}
          />
        ))}
      </div>
    </div>
  )
}

export default PlayerBoard 