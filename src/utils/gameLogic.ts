import type { GameState, Player, CardType, GameAction } from '../types/game'

// Generate a deck of cards with VibeJo distribution: 150 cards total
// 5 cards with value -2, 15 cards with value 0, 10 cards each for other values (-1 to 12)
export const generateDeck = (): CardType[] => {
  const deck: CardType[] = []
  
  // Add 5 cards with value -2
  for (let i = 0; i < 5; i++) {
    deck.push({
      id: `deck--2-${i}`,
      value: -2,
      isVisible: false,
      isRevealed: false,
      position: 0
    })
  }
  
  // Add 15 cards with value 0
  for (let i = 0; i < 15; i++) {
    deck.push({
      id: `deck-0-${i}`,
      value: 0,
      isVisible: false,
      isRevealed: false,
      position: 0
    })
  }
  
  // Add 10 cards each for values -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
  const otherValues = [-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  otherValues.forEach(value => {
    for (let i = 0; i < 10; i++) {
      deck.push({
        id: `deck-${value}-${i}`,
        value,
        isVisible: false,
        isRevealed: false,
        position: 0
      })
    }
  })
  
  return shuffleDeck(deck)
}

// Shuffle the deck using Fisher-Yates algorithm
export const shuffleDeck = (deck: CardType[]): CardType[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards to players
export const dealCards = (players: Player[], deck: CardType[], preserveTotalScore: boolean = false): { players: Player[], remainingDeck: CardType[] } => {
  const newPlayers = players.map(player => ({
    ...player,
    cards: Array.from({ length: 12 }, (_, i) => ({
      ...deck[i],
      position: i,
      isVisible: false,
      isRevealed: false
    })),
    score: 0,
    totalScore: preserveTotalScore ? player.totalScore : 0,
    hasFinished: false
  }))
  
  return {
    players: newPlayers,
    remainingDeck: deck.slice(12 * players.length)
  }
}

// Calculate the sum of revealed cards for a player
export const calculatePlayerSum = (player: Player): number => {
  return player.cards
    .filter(card => card.isVisible && !card.isRemoved)
    .reduce((sum, card) => sum + card.value, 0)
}

// Check if a player has three of a kind in a column
export const checkThreeOfAKind = (cards: CardType[]): number[] => {
  const columns = [0, 1, 2, 3]
  
  const cardsToRemove: number[] = []
  
  columns.forEach(col => {
    const columnCards = cards.filter(card => card.position % 4 === col && card.isVisible && !card.isRemoved)
    if (columnCards.length === 3) {
      const values = columnCards.map(card => card.value)
      if (values[0] === values[1] && values[1] === values[2]) {
        columnCards.forEach(card => cardsToRemove.push(card.position))
      }
    }
  })
  
  return cardsToRemove
}

// Remove cards from a player's hand
export const removeCards = (player: Player, positions: number[]): Player => {
  return {
    ...player,
    cards: player.cards.map(card => 
      positions.includes(card.position) 
        ? { ...card, isVisible: true, isRevealed: false, isRemoved: true, value: 0 }
        : card
    )
  }
}

// Check if a player has finished (all cards revealed or removed)
export const hasPlayerFinished = (player: Player): boolean => {
  return player.cards.every(card => card.isVisible || card.isRemoved)
}

// Check if the round should end (someone finished all cards)
export const shouldEndRound = (players: Player[]): boolean => {
  return players.some(player => hasPlayerFinished(player))
}

// Reveal all remaining cards and calculate final scores
export const revealAllCards = (players: Player[]): Player[] => {
  return players.map(player => ({
    ...player,
    cards: player.cards.map(card => ({
      ...card,
      isVisible: true
    })),
    score: calculateFinalScore({
      ...player,
      cards: player.cards.map(card => ({
        ...card,
        isVisible: true
      }))
    })
  }))
}

// Calculate final score for a player
export const calculateFinalScore = (player: Player): number => {
  return player.cards
    .filter(card => card.isVisible && !card.isRemoved)
    .reduce((sum, card) => sum + card.value, 0)
}

// Game reducer for state management
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      // Deal cards to all players
      const { players: dealtPlayers, remainingDeck: deckAfterInitialDeal } = dealCards(state.players, state.deck)
      const openCard = deckAfterInitialDeal[0]
      const initialDeck = deckAfterInitialDeal.slice(1)
      
      return {
        ...state,
        players: dealtPlayers,
        deck: initialDeck,
        openCard: {
          ...openCard,
          isVisible: true,
          isRevealed: true
        },
        gamePhase: 'initial',
        round: 1,
        currentPlayerIndex: 0,
        actionPhase: 'choose',
        selectedCardIndex: null,
        revealedCard: null,
        gameEndedBy: null,
        lastTurn: false
      }
      
    case 'REVEAL_CARDS':
      // Initial phase: everyone reveals 2 cards, highest sum starts
      const playersWithSums = state.players.map(player => ({
        ...player,
        cards: player.cards.map((card, index) => 
          index < 2 ? { ...card, isVisible: true } : card
        )
      }))
      
      const sums = playersWithSums.map(player => calculatePlayerSum(player))
      const highestSumIndex = sums.indexOf(Math.max(...sums))
      
      return {
        ...state,
        players: playersWithSums,
        currentPlayerIndex: highestSumIndex,
        gamePhase: 'playing',
        actionPhase: 'choose'
      }
      
    case 'PICK_OPEN_CARD':
      return {
        ...state,
        actionPhase: 'swap',
        selectedCardIndex: null
      }
      
    case 'PICK_REVEALED_CARD':
      // Move revealed card to open card position for swapping
      return {
        ...state,
        openCard: {
          ...state.revealedCard!,
          isVisible: true,
          isRevealed: true
        },
        revealedCard: null,
        actionPhase: 'swap',
        selectedCardIndex: null
      }
      
    case 'REJECT_REVEALED_CARD':
      // Reject revealed card, it becomes new open card, must reveal own card
      return {
        ...state,
        openCard: {
          ...state.revealedCard!,
          isVisible: true,
          isRevealed: true
        },
        revealedCard: null,
        actionPhase: 'reveal',
        selectedCardIndex: null
      }
      
    case 'SWAP_CARD':
      const { cardIndex } = action.payload
      const currentPlayer = state.players[state.currentPlayerIndex]
      const cardToSwap = state.openCard || state.revealedCard
      
      if (!cardToSwap) return state
      
      const updatedCards = [...currentPlayer.cards]
      const oldCard = updatedCards[cardIndex]
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        value: cardToSwap.value,
        isVisible: true
      }
      
      const updatedPlayers = state.players.map((player, index) =>
        index === state.currentPlayerIndex
          ? { ...player, cards: updatedCards }
          : player
      )
      
      // Check for three of a kind
      const cardsToRemove = checkThreeOfAKind(updatedCards)
      const finalPlayersAfterSwap = cardsToRemove.length > 0
        ? updatedPlayers.map((player, index) =>
            index === state.currentPlayerIndex
              ? removeCards(player, cardsToRemove)
              : player
          )
        : updatedPlayers
      
      // Check if round should end
      if (shouldEndRound(finalPlayersAfterSwap)) {
        const playersWithAllRevealed = revealAllCards(finalPlayersAfterSwap)
        const updatedPlayersWithTotals = playersWithAllRevealed.map(player => ({
          ...player,
          totalScore: player.totalScore + player.score
        }))
        
        // Check if game should end (someone over 100)
        const gameFinished = updatedPlayersWithTotals.some(player => player.totalScore >= 100)
        
        return {
          ...state,
          players: updatedPlayersWithTotals,
          gamePhase: gameFinished ? 'game_finished' : 'round_finished',
          openCard: null,
          revealedCard: null,
          actionPhase: 'choose' as const,
          selectedCardIndex: null
        }
      }
      
      // Auto-end turn after swap
      const nextPlayerAfterSwap = (state.currentPlayerIndex + 1) % state.players.length
      
      return {
        ...state,
        players: finalPlayersAfterSwap,
        openCard: {
          ...oldCard,
          isVisible: true,
          isRevealed: true
        },
        revealedCard: null,
        actionPhase: 'choose' as const,
        selectedCardIndex: null,
        currentPlayerIndex: nextPlayerAfterSwap
      }
      
    case 'REVEAL_OWN_CARD':
      const { revealCardIndex } = action.payload
      const playerToUpdate = state.players[state.currentPlayerIndex]
      const updatedPlayerCards = [...playerToUpdate.cards]
      updatedPlayerCards[revealCardIndex] = {
        ...updatedPlayerCards[revealCardIndex],
        isVisible: true
      }
      
      const updatedPlayerList = state.players.map((player, index) =>
        index === state.currentPlayerIndex
          ? { ...player, cards: updatedPlayerCards }
          : player
      )
      
      // Check for three of a kind
      const cardsToRemoveAfterReveal = checkThreeOfAKind(updatedPlayerCards)
      const finalPlayerList = cardsToRemoveAfterReveal.length > 0
        ? updatedPlayerList.map((player, index) =>
            index === state.currentPlayerIndex
              ? removeCards(player, cardsToRemoveAfterReveal)
              : player
          )
        : updatedPlayerList
      
      // Check if we're in initial phase and need to transition to playing
      if (state.gamePhase === 'initial') {
        const currentPlayerCards = finalPlayerList[state.currentPlayerIndex].cards
        const revealedCount = currentPlayerCards.filter(card => card.isVisible && !card.isRemoved).length
        
        // If current player has revealed 2 cards, move to next player
        if (revealedCount >= 2) {
          const nextPlayerInInitial = (state.currentPlayerIndex + 1) % state.players.length
          
          // Check if all players have revealed 2 cards
          const allPlayersRevealed = finalPlayerList.every(player => 
            player.cards.filter(card => card.isVisible && !card.isRemoved).length >= 2
          )
          
          if (allPlayersRevealed) {
            // Calculate sums and determine who starts
            const sums = finalPlayerList.map(player => calculatePlayerSum(player))
            const highestSumIndex = sums.indexOf(Math.max(...sums))
            
            return {
              ...state,
              players: finalPlayerList,
              currentPlayerIndex: highestSumIndex,
              gamePhase: 'playing',
              actionPhase: 'choose',
              selectedCardIndex: null
            }
          }
          
          // Move to next player
          return {
            ...state,
            players: finalPlayerList,
            actionPhase: 'choose',
            selectedCardIndex: null,
            currentPlayerIndex: nextPlayerInInitial
          }
        }
        
        // Current player hasn't revealed 2 cards yet, stay with them
        return {
          ...state,
          players: finalPlayerList,
          actionPhase: 'choose',
          selectedCardIndex: null
        }
      }
      
      // Check if round should end (only during playing phase)
      if (state.gamePhase === 'playing' && shouldEndRound(finalPlayerList)) {
        const playersWithAllRevealed = revealAllCards(finalPlayerList)
        const updatedPlayersWithTotals = playersWithAllRevealed.map(player => ({
          ...player,
          totalScore: player.totalScore + player.score
        }))
        
        // Check if game should end (someone over 100)
        const gameFinished = updatedPlayersWithTotals.some(player => player.totalScore >= 100)
        
        return {
          ...state,
          players: updatedPlayersWithTotals,
          gamePhase: gameFinished ? 'game_finished' : 'round_finished',
          openCard: null,
          revealedCard: null,
          actionPhase: 'choose' as const,
          selectedCardIndex: null
        }
      }
      
      // Auto-end turn after reveal (only during playing phase)
      const nextPlayerAfterReveal = (state.currentPlayerIndex + 1) % state.players.length 
      
      return {
        ...state,
        players: finalPlayerList,
        actionPhase: 'choose',
        selectedCardIndex: null,
        currentPlayerIndex: nextPlayerAfterReveal
      }
      
    case 'REVEAL_FROM_DECK':
      const { revealedCard: newRevealedCard, newDeck: updatedDeck } = action.payload
      return {
        ...state,
        deck: updatedDeck,
        revealedCard: {
          ...newRevealedCard,
          isVisible: true,
          isRevealed: true
        },
        actionPhase: 'choose_revealed',
        selectedCardIndex: null
      }
      
    case 'END_TURN':
      // Check if current player has finished
      const currentPlayerAfterTurn = state.players[state.currentPlayerIndex]
      const hasFinished = hasPlayerFinished(currentPlayerAfterTurn)
      
      let nextState = {
        ...state,
        players: state.players.map((player, index) =>
          index === state.currentPlayerIndex
            ? { ...player, hasFinished }
            : player
        ),
        actionPhase: 'choose' as const,
        selectedCardIndex: null,
        revealedCard: null
      }
      
      // Check if game should end
      const finishedPlayers = nextState.players.filter(player => player.hasFinished)
      if (finishedPlayers.length > 0 && !nextState.lastTurn) {
        nextState = {
          ...nextState,
          gameEndedBy: finishedPlayers[0].id,
          lastTurn: true
        }
      }
      
      // Move to next player
      let nextPlayerInTurn = (state.currentPlayerIndex + 1) % state.players.length
      
      // Skip finished players
      while (nextState.players[nextPlayerInTurn].hasFinished) {
        nextPlayerInTurn = (nextPlayerInTurn + 1) % state.players.length
      }
      
      return {
        ...nextState,
        currentPlayerIndex: nextPlayerInTurn
      }
      
    case 'START_NEW_ROUND':
      // Start a new round with fresh cards
      const freshDeck = generateDeck()
      const { players: newRoundPlayers, remainingDeck: deckAfterDealing } = dealCards(state.players, freshDeck, true)
      const newOpenCard = deckAfterDealing[0]
      const finalDeck = deckAfterDealing.slice(1)
      
      return {
        ...state,
        players: newRoundPlayers.map(player => ({
          ...player,
          score: 0, // Reset round score
          hasFinished: false
        })),
        deck: finalDeck,
        openCard: {
          ...newOpenCard,
          isVisible: true,
          isRevealed: true
        },
        gamePhase: 'initial',
        round: state.round + 1,
        currentPlayerIndex: 0,
        actionPhase: 'choose',
        selectedCardIndex: null,
        revealedCard: null,
        gameEndedBy: null,
        lastTurn: false
      }

    case 'END_GAME':
      return {
        ...state,
        gamePhase: 'game_finished'
      }
      
    default:
      return state
  }
} 