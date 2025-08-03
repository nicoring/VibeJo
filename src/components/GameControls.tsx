import type { GameState } from '../types/game'

interface GameControlsProps {
  gameState: GameState;
  isCurrentPlayer: boolean;
}

function GameControls({ gameState, isCurrentPlayer }: GameControlsProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const isMyTurn = isCurrentPlayer && gameState.gamePhase === 'playing'



  if (gameState.gamePhase === 'initial') {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const isHumanTurn = currentPlayer?.id === '1'
    const revealedCount = currentPlayer?.cards.filter(card => card.isVisible).length || 0
    
    return (
      <div className="game-controls">
        <div className="game-instructions">
          {isHumanTurn ? (
            <p>Your turn! Click on {2 - revealedCount} more card{2 - revealedCount !== 1 ? 's' : ''} to reveal.</p>
          ) : (
            <p>{currentPlayer?.name} is revealing their cards...</p>
          )}
        </div>
      </div>
    )
  }

  if (gameState.gamePhase === 'round_finished' || gameState.gamePhase === 'game_finished') {
    return null // Results are shown elsewhere
  }

  if (!isMyTurn) {
    return (
      <div className="game-controls">
        <div className="turn-info">
          <p>Waiting for {currentPlayer.name}'s turn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-controls">
      <div className="action-buttons">
        {gameState.actionPhase === 'choose' && (
          <div className="action-instructions">
            <p>Click on the deck to reveal a card, or click on the open card to pick it</p>
          </div>
        )}
        
        {gameState.actionPhase === 'choose_revealed' && (
          <div className="action-instructions">
            <p>Choose: Take the revealed card or reject it (and reveal one of your cards)</p>
          </div>
        )}
        
        {gameState.actionPhase === 'swap' && (
          <div className="swap-instructions">
            <p>Click a card to swap with the {gameState.openCard ? 'open' : 'revealed'} card</p>
          </div>
        )}
        
        {gameState.actionPhase === 'reveal' && (
          <div className="reveal-instructions">
            <p>Click a card to reveal it (you rejected the revealed card)</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameControls 