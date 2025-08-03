import type { CardType } from '../types/game'
import CardComponent from './Card'

interface GameBoardProps {
  deck: CardType[];
  openCard: CardType | null;
  onDeckClick?: () => void;
  onOpenCardClick?: () => void;
}

function GameBoard({ deck, openCard, onDeckClick, onOpenCardClick }: GameBoardProps) {
  return (
    <div className="game-board">
      <div className="game-center">
        <div className="deck-area">
          <div className="deck-container">
            <div className="deck" onClick={onDeckClick}>
              <div className="deck-cards">
                <div className="deck-card"></div>
                <div className="deck-card"></div>
                <div className="deck-card"></div>
              </div>
              <span className="deck-count">{deck.length}</span>
            </div>
          </div>
        </div>
        
        <div className="open-card-area">
          {openCard ? (
            <div onClick={onOpenCardClick} style={{ cursor: onOpenCardClick ? 'pointer' : 'default' }}>
              <CardComponent card={openCard} size="large" />
            </div>
          ) : (
            <div className="no-open-card">
              <span>No card revealed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameBoard 