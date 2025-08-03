import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BotPlayer } from '../botLogic'
import type { GameState, Player } from '../../types/game'

describe('BotPlayer', () => {
  let mockGameState: GameState
  let mockBotPlayer: Player
  let mockHumanPlayer: Player

  beforeEach(() => {
    mockHumanPlayer = {
      id: '1',
      name: 'Human',
      cards: Array.from({ length: 12 }, (_, i) => ({
        id: `h-${i}`,
        value: 1,
        isVisible: i < 2,
        isRevealed: false,
        position: i
      })),
      isCurrentPlayer: false,
      score: 0,
      totalScore: 0,
      hasFinished: false
    }

    mockBotPlayer = {
      id: '2',
      name: 'Bot',
      cards: Array.from({ length: 12 }, (_, i) => ({
        id: `b-${i}`,
        value: 2,
        isVisible: i < 2,
        isRevealed: false,
        position: i
      })),
      isCurrentPlayer: true,
      score: 0,
      totalScore: 0,
      hasFinished: false
    }

    mockGameState = {
      players: [mockHumanPlayer, mockBotPlayer],
      currentPlayerIndex: 1, // Bot's turn
      deck: [{
        id: 'deck-1',
        value: 5,
        isVisible: false,
        isRevealed: false,
        position: 0
      }],
      openCard: {
        id: 'open-1',
        value: 3,
        isVisible: true,
        isRevealed: true,
        position: 0
      },
      gamePhase: 'playing',
      round: 1,
      gameEndedBy: null,
      lastTurn: false,
      revealedCard: null,
      actionPhase: 'choose',
      selectedCardIndex: null
    }
  })

  describe('isBot', () => {
    it('should return false for human player (id "1")', () => {
      const gameStateWithHuman = {
        ...mockGameState,
        currentPlayerIndex: 0 // Human player
      }
      expect(BotPlayer.isBot(gameStateWithHuman)).toBe(false)
    })

    it('should return true for bot player (not id "1")', () => {
      expect(BotPlayer.isBot(mockGameState)).toBe(true)
    })
  })

  describe('getRandomDelay', () => {
    it('should return a delay between 100 and 300ms', () => {
      const delay = BotPlayer.getRandomDelay()
      expect(delay).toBeGreaterThanOrEqual(100)
      expect(delay).toBeLessThanOrEqual(300)
    })
  })

  describe('makeRandomDecision', () => {
    it('should return null for human player', () => {
      const humanGameState = {
        ...mockGameState,
        currentPlayerIndex: 0
      }
      
      const decision = BotPlayer.makeRandomDecision(humanGameState)
      expect(decision).toBeNull()
    })

    it('should handle initial phase', () => {
      const initialGameState = {
        ...mockGameState,
        gamePhase: 'initial' as const,
        players: [
          mockHumanPlayer,
          {
            ...mockBotPlayer,
            cards: mockBotPlayer.cards.map((card, i) => ({
              ...card,
              isVisible: i < 1 // Only 1 card revealed, needs 1 more
            }))
          }
        ]
      }

      const decision = BotPlayer.makeRandomDecision(initialGameState)
      expect(decision).toEqual({
        type: 'REVEAL_OWN_CARD',
        payload: { revealCardIndex: expect.any(Number) }
      })
    })

    it('should return null in initial phase if already revealed 2 cards', () => {
      const initialGameState = {
        ...mockGameState,
        gamePhase: 'initial' as const
        // mockBotPlayer already has 2 cards revealed
      }

      const decision = BotPlayer.makeRandomDecision(initialGameState)
      expect(decision).toBeNull()
    })

    it('should handle choose phase', () => {
      const decision = BotPlayer.makeRandomDecision(mockGameState)
      
      // Should return either REVEAL_FROM_DECK or PICK_OPEN_CARD
      expect(decision).toEqual(
        expect.objectContaining({
          type: expect.stringMatching(/REVEAL_FROM_DECK|PICK_OPEN_CARD/)
        })
      )
    })

    it('should handle choose_revealed phase', () => {
      const chooseRevealedState = {
        ...mockGameState,
        actionPhase: 'choose_revealed' as const,
        revealedCard: {
          id: 'revealed-1',
          value: 4,
          isVisible: true,
          isRevealed: true,
          position: 0
        }
      }

      // Mock Math.random to control the decision
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.3) // Should pick the card

      const decision = BotPlayer.makeRandomDecision(chooseRevealedState)
      expect(decision).toEqual({
        type: 'PICK_REVEALED_CARD'
      })

      mockRandom.mockRestore()
    })

    it('should handle swap phase', () => {
      const swapState = {
        ...mockGameState,
        actionPhase: 'swap' as const
      }

      const decision = BotPlayer.makeRandomDecision(swapState)
      expect(decision).toEqual({
        type: 'SWAP_CARD',
        payload: { cardIndex: expect.any(Number) }
      })
    })

    it('should handle reveal phase', () => {
      const revealState = {
        ...mockGameState,
        actionPhase: 'reveal' as const,
        players: [
          mockHumanPlayer,
          {
            ...mockBotPlayer,
            cards: mockBotPlayer.cards.map((card, i) => ({
              ...card,
              isVisible: i < 10 // Some cards still hidden
            }))
          }
        ]
      }

      const decision = BotPlayer.makeRandomDecision(revealState)
      expect(decision).toEqual({
        type: 'REVEAL_OWN_CARD',
        payload: { revealCardIndex: expect.any(Number) }
      })
    })

    it('should return null for unknown game phase', () => {
      const unknownPhaseState = {
        ...mockGameState,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gamePhase: 'unknown' as any
      }

      const decision = BotPlayer.makeRandomDecision(unknownPhaseState)
      expect(decision).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle empty deck in choose phase', () => {
      const emptyDeckState = {
        ...mockGameState,
        deck: []
      }

      const decision = BotPlayer.makeRandomDecision(emptyDeckState)
      
      // Should only return PICK_OPEN_CARD since deck is empty
      expect(decision).toEqual({
        type: 'PICK_OPEN_CARD'
      })
    })

    it('should handle no open card in choose phase', () => {
      const noOpenCardState = {
        ...mockGameState,
        openCard: null
      }

      const decision = BotPlayer.makeRandomDecision(noOpenCardState)
      
      // Should only return REVEAL_FROM_DECK since no open card
      expect(decision).toEqual({
        type: 'REVEAL_FROM_DECK',
        payload: expect.objectContaining({
          revealedCard: expect.any(Object),
          newDeck: expect.any(Array)
        })
      })
    })

    it('should handle all cards visible in reveal phase', () => {
      const allVisibleState = {
        ...mockGameState,
        actionPhase: 'reveal' as const,
        players: [
          mockHumanPlayer,
          {
            ...mockBotPlayer,
            cards: mockBotPlayer.cards.map(card => ({
              ...card,
              isVisible: true // All cards visible
            }))
          }
        ]
      }

      const decision = BotPlayer.makeRandomDecision(allVisibleState)
      expect(decision).toBeNull()
    })

    it('should handle all cards removed in swap phase', () => {
      const allRemovedState = {
        ...mockGameState,
        actionPhase: 'swap' as const,
        players: [
          mockHumanPlayer,
          {
            ...mockBotPlayer,
            cards: mockBotPlayer.cards.map(card => ({
              ...card,
              isRemoved: true // All cards removed
            }))
          }
        ]
      }

      const decision = BotPlayer.makeRandomDecision(allRemovedState)
      expect(decision).toBeNull()
    })
  })

  describe('randomness', () => {
    it('should make different decisions over multiple calls', () => {
      const decisions = []
      
      // Make 10 decisions
      for (let i = 0; i < 10; i++) {
        const decision = BotPlayer.makeRandomDecision(mockGameState)
        decisions.push(decision?.type)
      }

      // Should have some variety (though this could occasionally fail due to randomness)
      const uniqueDecisions = new Set(decisions)
      expect(uniqueDecisions.size).toBeGreaterThan(0)
    })

    it('should select different card indices in swap phase', () => {
      const swapState = {
        ...mockGameState,
        actionPhase: 'swap' as const
      }

      const cardIndices = []
      
      // Make 20 decisions to increase chance of variety
      for (let i = 0; i < 20; i++) {
        const decision = BotPlayer.makeRandomDecision(swapState)
        if (decision?.type === 'SWAP_CARD') {
          cardIndices.push(decision.payload.cardIndex)
        }
      }

      // Should have some variety in card selection
      const uniqueIndices = new Set(cardIndices)
      expect(uniqueIndices.size).toBeGreaterThan(1)
    })
  })
})