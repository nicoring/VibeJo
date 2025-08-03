import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateDeck,
  shuffleDeck,
  dealCards,
  calculatePlayerSum,
  hasPlayerFinished,
  checkThreeOfAKind,
  gameReducer
} from '../gameLogic'
import type { GameState, Player, CardType } from '../../types/game'

describe('gameLogic', () => {
  describe('generateDeck', () => {
    it('should generate a deck with 150 cards', () => {
      const deck = generateDeck()
      expect(deck).toHaveLength(150)
    })

    it('should have correct card distribution', () => {
      const deck = generateDeck()
      const valueCount: Record<number, number> = {}
      
      deck.forEach(card => {
        valueCount[card.value] = (valueCount[card.value] || 0) + 1
      })

      // Check specific distributions
      expect(valueCount[-2]).toBe(5)  // 5 cards with value -2
      expect(valueCount[0]).toBe(15)  // 15 cards with value 0
      expect(valueCount[1]).toBe(10)  // 10 cards with value 1
      expect(valueCount[12]).toBe(10) // 10 cards with value 12
    })

    it('should assign unique IDs to each card', () => {
      const deck = generateDeck()
      const ids = deck.map(card => card.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(deck.length)
    })
  })

  describe('shuffleDeck', () => {
    it('should return a deck with the same length', () => {
      const originalDeck = generateDeck()
      const shuffled = shuffleDeck([...originalDeck])
      expect(shuffled).toHaveLength(originalDeck.length)
    })

    it('should contain the same cards', () => {
      const originalDeck = generateDeck()
      const shuffled = shuffleDeck([...originalDeck])
      
      // Sort both arrays by ID to compare content
      const originalSorted = [...originalDeck].sort((a, b) => a.id.localeCompare(b.id))
      const shuffledSorted = [...shuffled].sort((a, b) => a.id.localeCompare(b.id))
      
      expect(shuffledSorted).toEqual(originalSorted)
    })
  })

  describe('dealCards', () => {
    let mockPlayers: Player[]
    let mockDeck: CardType[]

    beforeEach(() => {
      mockPlayers = [
        {
          id: '1',
          name: 'Player 1',
          cards: [],
          isCurrentPlayer: true,
          score: 0,
          totalScore: 50,
          hasFinished: false
        },
        {
          id: '2', 
          name: 'Player 2',
          cards: [],
          isCurrentPlayer: false,
          score: 0,
          totalScore: 30,
          hasFinished: false
        }
      ]
      mockDeck = generateDeck()
    })

    it('should deal 12 cards to each player', () => {
      const { players } = dealCards(mockPlayers, mockDeck)
      players.forEach(player => {
        expect(player.cards).toHaveLength(12)
      })
    })

    it('should preserve totalScore when flag is true', () => {
      const { players } = dealCards(mockPlayers, mockDeck, true)
      expect(players[0].totalScore).toBe(50)
      expect(players[1].totalScore).toBe(30)
    })

    it('should reset totalScore when flag is false', () => {
      const { players } = dealCards(mockPlayers, mockDeck, false)
      expect(players[0].totalScore).toBe(0)
      expect(players[1].totalScore).toBe(0)
    })

    it('should return correct remaining deck size', () => {
      const { remainingDeck } = dealCards(mockPlayers, mockDeck)
      expect(remainingDeck).toHaveLength(150 - (2 * 12)) // 150 - 24 = 126
    })
  })

  describe('calculatePlayerSum', () => {
    it('should calculate sum of visible cards only', () => {
      const player: Player = {
        id: '1',
        name: 'Test',
        cards: [
          { id: '1', value: 5, isVisible: true, isRevealed: false, position: 0 },
          { id: '2', value: 3, isVisible: false, isRevealed: false, position: 1 },
          { id: '3', value: -2, isVisible: true, isRevealed: false, position: 2 }
        ],
        isCurrentPlayer: true,
        score: 0,
        totalScore: 0,
        hasFinished: false
      }

      const sum = calculatePlayerSum(player)
      expect(sum).toBe(3) // 5 + (-2) = 3, ignoring the hidden card with value 3
    })

    it('should exclude removed cards from sum', () => {
      const player: Player = {
        id: '1',
        name: 'Test',
        cards: [
          { id: '1', value: 5, isVisible: true, isRevealed: false, position: 0 },
          { id: '2', value: 3, isVisible: true, isRevealed: false, position: 1, isRemoved: true },
          { id: '3', value: -2, isVisible: true, isRevealed: false, position: 2 }
        ],
        isCurrentPlayer: true,
        score: 0,
        totalScore: 0,
        hasFinished: false
      }

      const sum = calculatePlayerSum(player)
      expect(sum).toBe(3) // 5 + (-2) = 3, ignoring the removed card
    })
  })

  describe('hasPlayerFinished', () => {
    it('should return true when all cards are visible', () => {
      const player: Player = {
        id: '1',
        name: 'Test',
        cards: Array.from({ length: 12 }, (_, i) => ({
          id: `${i}`,
          value: 1,
          isVisible: true,
          isRevealed: false,
          position: i
        })),
        isCurrentPlayer: true,
        score: 0,
        totalScore: 0,
        hasFinished: false
      }

      expect(hasPlayerFinished(player)).toBe(true)
    })

    it('should return false when some cards are not visible', () => {
      const player: Player = {
        id: '1',
        name: 'Test',
        cards: Array.from({ length: 12 }, (_, i) => ({
          id: `${i}`,
          value: 1,
          isVisible: i < 11, // Last card is not visible
          isRevealed: false,
          position: i
        })),
        isCurrentPlayer: true,
        score: 0,
        totalScore: 0,
        hasFinished: false
      }

      expect(hasPlayerFinished(player)).toBe(false)
    })
  })

  describe('checkThreeOfAKind', () => {
    it('should detect three of a kind in a column', () => {
      const cards: CardType[] = Array.from({ length: 12 }, (_, i) => ({
        id: `${i}`,
        value: [0, 4, 8].includes(i) ? 5 : (i + 1), // First column (positions 0,4,8) has three 5s, others have different values
        isVisible: true,
        isRevealed: false,
        position: i
      }))

      const toRemove = checkThreeOfAKind(cards)
      expect(toRemove).toHaveLength(3)
      expect(toRemove).toEqual([0, 4, 8])
    })

    it('should not detect three of a kind with removed cards', () => {
      const cards: CardType[] = Array.from({ length: 12 }, (_, i) => ({
        id: `${i}`,
        value: [0, 4, 8].includes(i) ? 5 : (i + 1),
        isVisible: true,
        isRevealed: false,
        position: i,
        isRemoved: i === 4 // One card is removed from the column
      }))

      const toRemove = checkThreeOfAKind(cards)
      expect(toRemove).toHaveLength(0)
    })
  })

  describe('gameReducer', () => {
    let initialState: GameState

    beforeEach(() => {
      initialState = {
        players: [
          {
            id: '1',
            name: 'Player 1',
            cards: [],
            isCurrentPlayer: true,
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
    })

    it('should handle START_GAME action', () => {
      const action = { type: 'START_GAME' as const }
      const newState = gameReducer(initialState, action)

      expect(newState.gamePhase).toBe('initial')
      expect(newState.players[0].cards).toHaveLength(12)
      expect(newState.openCard).toBeTruthy()
      expect(newState.deck.length).toBeLessThan(150)
    })

    it('should handle REVEAL_OWN_CARD action in initial phase', () => {
      // First start the game to get cards
      const startState = gameReducer(initialState, { type: 'START_GAME' })
      
      const action = {
        type: 'REVEAL_OWN_CARD' as const,
        payload: { revealCardIndex: 0 }
      }
      
      const newState = gameReducer(startState, action)
      expect(newState.players[0].cards[0].isVisible).toBe(true)
    })

    it('should transition from initial to playing phase when all players reveal 2 cards', () => {
      // Start with multiple players
      const multiPlayerState: GameState = {
        ...initialState,
        players: [
          {
            id: '1',
            name: 'Player 1',
            cards: Array.from({ length: 12 }, (_, i) => ({
              id: `1-${i}`,
              value: 1,
              isVisible: i < 2, // Already revealed 2 cards
              isRevealed: false,
              position: i
            })),
            isCurrentPlayer: true,
            score: 0,
            totalScore: 0,
            hasFinished: false
          },
          {
            id: '2',
            name: 'Player 2', 
            cards: Array.from({ length: 12 }, (_, i) => ({
              id: `2-${i}`,
              value: 1,
              isVisible: i < 1, // Only revealed 1 card
              isRevealed: false,
              position: i
            })),
            isCurrentPlayer: false,
            score: 0,
            totalScore: 0,
            hasFinished: false
          }
        ],
        currentPlayerIndex: 1 // Player 2's turn
      }

      // Player 2 reveals their second card
      const action = {
        type: 'REVEAL_OWN_CARD' as const,
        payload: { revealCardIndex: 1 }
      }

      const newState = gameReducer(multiPlayerState, action)
      expect(newState.gamePhase).toBe('playing')
      expect(newState.actionPhase).toBe('choose')
    })
  })
})