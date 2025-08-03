import { useReducer, useEffect } from 'react'
import type { GameState, GameAction } from '../types/game'
import { gameReducer, generateDeck } from '../utils/gameLogic'
import { BotPlayer } from '../utils/botLogic'
import PlayerBoard from './PlayerBoard'
import GameBoard from './GameBoard'
import Card from './Card'
import GameControls from './GameControls'

interface GameProps {
  username: string;
  onBackToMenu: () => void;
}

function Game({ username, onBackToMenu }: GameProps) {
  // Initialize game state
  const initialGameState: GameState = {
    players: [
      {
        id: '1',
        name: username,
        isCurrentPlayer: true,
        cards: [],
        score: 0,
        totalScore: 0,
        hasFinished: false
      },
      {
        id: '2',
        name: 'Player 2',
        isCurrentPlayer: false,
        cards: [],
        score: 0,
        totalScore: 0,
        hasFinished: false
      },
      {
        id: '3',
        name: 'Player 3',
        isCurrentPlayer: false,
        cards: [],
        score: 0,
        totalScore: 0,
        hasFinished: false
      }
    ],
    currentPlayerIndex: 0,
    deck: generateDeck(),
    openCard: null,
    gamePhase: 'initial',
    round: 1,
    gameEndedBy: null,
    lastTurn: false,
    revealedCard: null,
    actionPhase: 'choose',
    selectedCardIndex: null
  }

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)

  // Auto-start the game by dealing cards immediately
  useEffect(() => {
    dispatch({ type: 'START_GAME' })
  }, [])

  // Bot turn automation
  useEffect(() => {
    if (BotPlayer.isBot(gameState)) {
      const botAction = BotPlayer.makeRandomDecision(gameState)
      
      if (botAction) {
        // Add a delay to make bot actions more visible and natural
        const delay = BotPlayer.getRandomDelay()
        const timeoutId = setTimeout(() => {
          dispatch(botAction)
        }, delay)

        return () => clearTimeout(timeoutId)
      }
    }
  }, [gameState])



  const handleGameAction = (action: GameAction) => {
    dispatch(action)
  }

  const handleCardClick = (playerId: string, cardIndex: number) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    const clickedCard = currentPlayer.cards[cardIndex]
    
    // Don't allow clicking on removed cards
    if (clickedCard.isRemoved) {
      return
    }
    
    // Only allow actions for current player
    if (playerId === currentPlayer.id) {
      if (gameState.gamePhase === 'initial') {
        // In initial phase, clicking cards reveals them (max 2 cards)
        const revealedCards = currentPlayer.cards.filter(card => card.isVisible && !card.isRemoved)
        if (revealedCards.length < 2 && !clickedCard.isVisible) {
          handleGameAction({ 
            type: 'REVEAL_OWN_CARD', 
            payload: { revealCardIndex: cardIndex } 
          })
        }
      } else if (gameState.actionPhase === 'swap') {
        // In swap phase, clicking cards swaps them
        handleGameAction({ 
          type: 'SWAP_CARD', 
          payload: { cardIndex } 
        })
      } else if (gameState.actionPhase === 'reveal') {
        // In reveal phase, clicking cards reveals them (only after rejecting a drawn card)
        if (!clickedCard.isVisible) {
          handleGameAction({ 
            type: 'REVEAL_OWN_CARD', 
            payload: { revealCardIndex: cardIndex } 
          })
        }
      } else if (gameState.actionPhase === 'choose' && gameState.openCard) {
        // In choose phase during normal play, clicking your own card swaps it with the open card
        handleGameAction({ 
          type: 'SWAP_CARD', 
          payload: { cardIndex } 
        })
      }
    }
  }

  const handleDeckClick = () => {
    if (gameState.gamePhase === 'playing' && gameState.actionPhase === 'choose') {
      // Reveal a card from the deck
      const newRevealedCard = gameState.deck[0]
      const newDeck = gameState.deck.slice(1)
      
      // Update the game state with the revealed card
      handleGameAction({ 
        type: 'REVEAL_FROM_DECK', 
        payload: { revealedCard: newRevealedCard, newDeck: newDeck } 
      })
    }
  }

  const handleOpenCardClick = () => {
    if (gameState.gamePhase === 'playing' && gameState.actionPhase === 'choose' && gameState.openCard) {
      // Pick the open card (only in choose phase, not choose_revealed)
      handleGameAction({ 
        type: 'PICK_OPEN_CARD' 
      })
    }
  }

  const isCurrentPlayer = gameState.players[gameState.currentPlayerIndex]?.id === '1'

  return (
    <div className="app">
      <header className="app-header">
        <h1>VibeJo</h1>
        <p>Welcome, {username}!</p>
        {gameState.gamePhase === 'initial' && (
          <div className="game-info">
            <p>Each player reveals 2 cards. The player with the highest sum starts the game.</p>
            <p>Current turn: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
            {gameState.players[gameState.currentPlayerIndex]?.id === '1' && (
              <p>Click on 2 of your cards to reveal them</p>
            )}
          </div>
        )}
        {gameState.gamePhase === 'playing' && (
          <div className="game-info">
            <p>Round: {gameState.round} | Turn: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
            <div className="total-scores">
              {gameState.players.map(player => (
                <span key={player.id} className="total-score-item">
                  {player.name}: {player.totalScore}
                </span>
              ))}
            </div>
            {BotPlayer.isBot(gameState) && <p className="bot-turn">🤖 Bot is thinking...</p>}
            {gameState.lastTurn && <p className="last-turn">Last Turn!</p>}
          </div>
        )}
      </header>
      
      {/* Round Results */}
      {gameState.gamePhase === 'round_finished' && (
        <div className="round-results">
          <div className="results-container">
            <h2>Round {gameState.round} Results</h2>
            <div className="scores-table">
              {gameState.players.map(player => (
                <div key={player.id} className="score-row">
                  <span className="player-name">{player.name}</span>
                  <span className="round-score">+{player.score}</span>
                  <span className="total-score">Total: {player.totalScore}</span>
                </div>
              ))}
            </div>
            <button 
              className="start-button"
              onClick={() => handleGameAction({ type: 'START_NEW_ROUND' })}
            >
              Start Next Round
            </button>
          </div>
        </div>
      )}

      {/* Game Finished */}
      {gameState.gamePhase === 'game_finished' && (
        <div className="game-finished">
          <div className="results-container">
            <h2>Game Over!</h2>
            <div className="scores-table">
              {gameState.players
                .sort((a, b) => a.totalScore - b.totalScore)
                .map((player, index) => (
                  <div key={player.id} className={`score-row ${index === 0 ? 'winner' : ''}`}>
                    <span className="rank">#{index + 1}</span>
                    <span className="player-name">{player.name}</span>
                    <span className="total-score">{player.totalScore} points</span>
                  </div>
                ))}
            </div>
            <button 
              className="start-button"
              onClick={onBackToMenu}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
      
      {(gameState.gamePhase === 'initial' || gameState.gamePhase === 'playing') && (
        <main className="game-main">
          <div className="game-layout">
          {/* Top Row: Other Players + Deck + Open Card */}
          <div className="top-row">
            <div className="other-players">
              {gameState.players
                .filter(player => !player.isCurrentPlayer)
                .map(player => (
                  <PlayerBoard
                    key={player.id}
                    player={player}
                    isCurrentPlayer={false}
                  />
                ))}
            </div>
            
            {/* Game Center: Deck + Open Card */}
            <GameBoard 
              deck={gameState.deck}
              openCard={gameState.openCard}
              onDeckClick={handleDeckClick}
              onOpenCardClick={gameState.actionPhase === 'choose' ? handleOpenCardClick : undefined}
            />
            
            {/* Revealed Card */}
            {gameState.revealedCard && (
              <div className="revealed-card-section">
                <div className="revealed-card-display">
                  <span className="revealed-card-label">Revealed from deck:</span>
                  <div 
                    onClick={() => {
                      if (gameState.gamePhase === 'playing' && gameState.actionPhase === 'choose_revealed') {
                        handleGameAction({ type: 'PICK_REVEALED_CARD' })
                      }
                    }}
                    style={{ cursor: gameState.gamePhase === 'playing' && gameState.actionPhase === 'choose_revealed' ? 'pointer' : 'default' }}
                  >
                    <Card card={gameState.revealedCard} size="large" />
                  </div>
                  {gameState.actionPhase === 'choose_revealed' && isCurrentPlayer && (
                    <div className="revealed-card-actions">
                      <button 
                        className="action-button"
                        onClick={() => handleGameAction({ type: 'PICK_REVEALED_CARD' })}
                      >
                        Take Card
                      </button>
                      <button 
                        className="action-button reject-button"
                        onClick={() => handleGameAction({ type: 'REJECT_REVEALED_CARD' })}
                      >
                        Reject (Reveal Own)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Current Player */}
          <div className="current-player-area">
            {gameState.players
              .filter(player => player.isCurrentPlayer)
              .map(player => (
                <PlayerBoard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={true}
                  onCardClick={(cardIndex) => handleCardClick(player.id, cardIndex)}
                />
              ))}
          </div>
        </div>
        
        {/* Game Controls */}
        <GameControls
          gameState={gameState}
          isCurrentPlayer={isCurrentPlayer}
        />
        
        <div className="game-controls">
          <button 
            className="start-button"
            onClick={onBackToMenu}
          >
            Back to Menu
          </button>
        </div>
        </main>
      )}
    </div>
  )
}

export default Game 