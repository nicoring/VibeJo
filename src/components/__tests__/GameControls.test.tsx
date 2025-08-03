import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GameControls from '../GameControls'
import type { GameState } from '../../types/game'

describe('GameControls', () => {
  const createMockGameState = (overrides: Partial<GameState> = {}): GameState => ({
    players: [
      {
        id: '1',
        name: 'Human Player',
        cards: Array.from({ length: 12 }, (_, i) => ({
          id: `h-${i}`,
          value: 1,
          isVisible: i < 2,
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
        name: 'Bot Player',
        cards: Array.from({ length: 12 }, (_, i) => ({
          id: `b-${i}`,
          value: 2,
          isVisible: i < 2,
          isRevealed: false,
          position: i
        })),
        isCurrentPlayer: false,
        score: 0,
        totalScore: 0,
        hasFinished: false
      }
    ],
    currentPlayerIndex: 0,
    deck: [],
    openCard: null,
    gamePhase: 'playing',
    round: 1,
    gameEndedBy: null,
    lastTurn: false,
    revealedCard: null,
    actionPhase: 'choose',
    selectedCardIndex: null,
    ...overrides
  })

  describe('initial phase', () => {
    it('should show instructions for human player during initial phase', () => {
      const gameState = createMockGameState({
        gamePhase: 'initial',
        players: [
          {
            id: '1',
            name: 'Human Player',
            cards: Array.from({ length: 12 }, (_, i) => ({
              id: `h-${i}`,
              value: 1,
              isVisible: i < 1, // Only 1 card revealed
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
            name: 'Bot Player',
            cards: Array.from({ length: 12 }, (_, i) => ({
              id: `b-${i}`,
              value: 2,
              isVisible: false,
              isRevealed: false,
              position: i
            })),
            isCurrentPlayer: false,
            score: 0,
            totalScore: 0,
            hasFinished: false
          }
        ],
        currentPlayerIndex: 0
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Your turn! Click on 1 more card to reveal/)).toBeInTheDocument()
    })

    it('should show plural form when multiple cards needed', () => {
      const gameState = createMockGameState({
        gamePhase: 'initial',
        players: [
          {
            id: '1',
            name: 'Human Player',
            cards: Array.from({ length: 12 }, (_, i) => ({
              id: `h-${i}`,
              value: 1,
              isVisible: false, // No cards revealed
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
            name: 'Bot Player',
            cards: Array.from({ length: 12 }, (_, i) => ({
              id: `b-${i}`,
              value: 2,
              isVisible: false,
              isRevealed: false,
              position: i
            })),
            isCurrentPlayer: false,
            score: 0,
            totalScore: 0,
            hasFinished: false
          }
        ],
        currentPlayerIndex: 0
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Your turn! Click on 2 more cards to reveal/)).toBeInTheDocument()
    })

    it('should show bot turn message during initial phase', () => {
      const gameState = createMockGameState({
        gamePhase: 'initial',
        currentPlayerIndex: 1 // Bot's turn
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={false} />)
      
      expect(screen.getByText(/Bot Player is revealing their cards/)).toBeInTheDocument()
    })
  })

  describe('playing phase', () => {
    it('should show waiting message when not current player', () => {
      const gameState = createMockGameState({
        currentPlayerIndex: 1 // Bot's turn
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={false} />)
      
      expect(screen.getByText(/Waiting for Bot Player's turn/)).toBeInTheDocument()
    })

    it('should show choose phase instructions', () => {
      const gameState = createMockGameState({
        actionPhase: 'choose'
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Click on the deck to reveal a card, or click on the open card to pick it/)).toBeInTheDocument()
    })

    it('should show choose_revealed phase instructions', () => {
      const gameState = createMockGameState({
        actionPhase: 'choose_revealed'
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Choose: Take the revealed card or reject it/)).toBeInTheDocument()
    })

    it('should show swap phase instructions with open card', () => {
      const gameState = createMockGameState({
        actionPhase: 'swap',
        openCard: {
          id: 'open-1',
          value: 5,
          isVisible: true,
          isRevealed: true,
          position: 0
        }
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Click a card to swap with the open card/)).toBeInTheDocument()
    })

    it('should show swap phase instructions with revealed card', () => {
      const gameState = createMockGameState({
        actionPhase: 'swap',
        openCard: null,
        revealedCard: {
          id: 'revealed-1',
          value: 3,
          isVisible: true,
          isRevealed: true,
          position: 0
        }
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Click a card to swap with the revealed card/)).toBeInTheDocument()
    })

    it('should show reveal phase instructions', () => {
      const gameState = createMockGameState({
        actionPhase: 'reveal'
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(screen.getByText(/Click a card to reveal it \(you rejected the revealed card\)/)).toBeInTheDocument()
    })
  })

  describe('finished phases', () => {
    it('should render nothing for round_finished phase', () => {
      const gameState = createMockGameState({
        gamePhase: 'round_finished'
      })

      const { container } = render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should render nothing for game_finished phase', () => {
      const gameState = createMockGameState({
        gamePhase: 'game_finished'
      })

      const { container } = render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle when not my turn during playing phase', () => {
      const gameState = createMockGameState({
        gamePhase: 'playing'
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={false} />)
      
      expect(screen.getByText(/Waiting for Human Player's turn/)).toBeInTheDocument()
    })

    it('should handle unknown action phase gracefully', () => {
      const gameState = createMockGameState({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actionPhase: 'unknown' as any
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      // Should still render the game-controls container without crashing
      const container = document.querySelector('.game-controls')
      expect(container).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const gameState = createMockGameState({
        actionPhase: 'choose'
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      // Should have a main container
      const container = document.querySelector('.game-controls')
      expect(container).toHaveClass('game-controls')
    })

    it('should provide clear instructions', () => {
      const gameState = createMockGameState({
        actionPhase: 'choose'
      })

      render(<GameControls gameState={gameState} isCurrentPlayer={true} />)
      
      // Instructions should be clearly readable
      const instructions = screen.getByText(/Click on the deck to reveal a card/)
      expect(instructions).toBeInTheDocument()
    })
  })
})