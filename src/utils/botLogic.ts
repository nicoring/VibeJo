import type { GameState, Player, GameAction } from '../types/game'

// Bot decision-making logic for random choices
export class BotPlayer {
  static makeRandomDecision(gameState: GameState): GameAction | null {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    
    // Only make decisions for bot players (not the human player with id '1')
    if (currentPlayer.id === '1') {
      return null
    }

    // Handle different game phases
    switch (gameState.gamePhase) {
      case 'initial':
        return this.makeInitialPhaseDecision(gameState, currentPlayer)
      case 'playing':
        return this.makePlayingPhaseDecision(gameState, currentPlayer)
      default:
        return null
    }
  }

  // Initial phase: randomly reveal cards (exactly 2 cards)
  private static makeInitialPhaseDecision(_gameState: GameState, player: Player): GameAction | null {
    const revealedCards = player.cards.filter(card => card.isVisible)
    
    // Only reveal cards if we haven't revealed 2 yet
    if (revealedCards.length >= 2) {
      return null // Already revealed enough cards
    }

    // Find unrevealed, non-removed cards
    const unrevealedCards = player.cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => !card.isVisible && !card.isRemoved)

    if (unrevealedCards.length === 0) {
      return null // No cards to reveal
    }

    // Randomly pick a card to reveal
    const randomCard = unrevealedCards[Math.floor(Math.random() * unrevealedCards.length)]
    
    return {
      type: 'REVEAL_OWN_CARD',
      payload: { revealCardIndex: randomCard.index }
    }
  }

  // Playing phase: make random choices
  private static makePlayingPhaseDecision(gameState: GameState, player: Player): GameAction | null {
    switch (gameState.actionPhase) {
      case 'choose':
        return this.makeChoosePhaseDecision(gameState)
      case 'choose_revealed':
        return this.makeChooseRevealedPhaseDecision()
      case 'swap':
        return this.makeSwapPhaseDecision(player)
      case 'reveal':
        return this.makeRevealPhaseDecision(player)
      default:
        return null
    }
  }

  // Choose phase: randomly pick deck or open card
  private static makeChoosePhaseDecision(gameState: GameState): GameAction | null {
    const options: GameAction[] = []

    // Option 1: Reveal from deck
    if (gameState.deck.length > 0) {
      const revealedCard = gameState.deck[0]
      const newDeck = gameState.deck.slice(1)
      options.push({
        type: 'REVEAL_FROM_DECK',
        payload: { revealedCard, newDeck }
      })
    }

    // Option 2: Pick open card (if available)
    if (gameState.openCard) {
      options.push({
        type: 'PICK_OPEN_CARD'
      })
    }

    // Randomly choose an option
    if (options.length > 0) {
      return options[Math.floor(Math.random() * options.length)]
    }

    return null
  }

  // Choose revealed phase: randomly pick or reject revealed card
  private static makeChooseRevealedPhaseDecision(): GameAction | null {
    // Randomly choose between picking and rejecting (50/50 chance)
    const shouldPick = Math.random() < 0.5
    
    return {
      type: shouldPick ? 'PICK_REVEALED_CARD' : 'REJECT_REVEALED_CARD'
    }
  }

  // Reveal phase: randomly pick a card to reveal
  private static makeRevealPhaseDecision(player: Player): GameAction | null {
    // Find unrevealed, non-removed cards
    const unrevealedCards = player.cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => !card.isVisible && !card.isRemoved)

    if (unrevealedCards.length === 0) {
      return null // No cards to reveal
    }

    // Randomly pick a card to reveal
    const randomCard = unrevealedCards[Math.floor(Math.random() * unrevealedCards.length)]
    
    return {
      type: 'REVEAL_OWN_CARD',
      payload: { revealCardIndex: randomCard.index }
    }
  }

  // Swap phase: randomly pick a card to swap
  private static makeSwapPhaseDecision(player: Player): GameAction | null {
    // Get all non-removed card positions
    const availableCardIndices = player.cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => !card.isRemoved)
      .map(({ index }) => index)
    
    if (availableCardIndices.length === 0) {
      return null // No cards available to swap
    }
    
    // Randomly pick a card to swap
    const randomCardIndex = availableCardIndices[Math.floor(Math.random() * availableCardIndices.length)]
    
    return {
      type: 'SWAP_CARD',
      payload: { cardIndex: randomCardIndex }
    }
  }

  // Check if current player is a bot
  static isBot(gameState: GameState): boolean {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    return currentPlayer.id !== '1' // Human player has id '1'
  }

  // Get random delay for more natural bot behavior (in milliseconds)
  static getRandomDelay(): number {
    return Math.random() * 200 + 100 // 100ms to 300ms
  }
}