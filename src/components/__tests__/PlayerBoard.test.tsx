import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlayerBoard from '../PlayerBoard'
import type { Player } from '../../types/game'

describe('PlayerBoard', () => {
  const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
    id: '1',
    name: 'Test Player',
    cards: Array.from({ length: 12 }, (_, i) => ({
      id: `card-${i}`,
      value: i + 1,
      isVisible: i < 6, // First 6 cards visible
      isRevealed: false,
      position: i
    })),
    isCurrentPlayer: false,
    score: 25,
    totalScore: 75,
    hasFinished: false,
    ...overrides
  })

  it('should render player name', () => {
    const player = createMockPlayer({ name: 'Alice' })
    
    render(<PlayerBoard player={player} isCurrentPlayer={false} />)
    
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('should show "You" badge for current player', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={true} />)
    
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('should not show "You" badge for other players', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={false} />)
    
    expect(screen.queryByText('You')).not.toBeInTheDocument()
  })

  it('should render all 12 cards', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={false} />)
    
    // Should have 12 cards
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(12)
  })

  it('should apply current-player class when isCurrentPlayer is true', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={true} />)
    
    const playerBoard = document.querySelector('.player-board')
    expect(playerBoard).toHaveClass('player-board', 'current-player')
  })

  it('should not apply current-player class when isCurrentPlayer is false', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={false} />)
    
    const playerBoard = document.querySelector('.player-board')
    expect(playerBoard).toHaveClass('player-board')
    expect(playerBoard).not.toHaveClass('current-player')
  })

  it('should use medium size cards for current player', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={true} />)
    
    const cards = screen.getAllByTestId('card')
    cards.forEach(card => {
      expect(card).toHaveClass('card-medium')
    })
  })

  it('should use small size cards for other players', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={false} />)
    
    const cards = screen.getAllByTestId('card')
    cards.forEach(card => {
      expect(card).toHaveClass('card-small')
    })
  })

  it('should make cards clickable only for current player', () => {
    const handleCardClick = vi.fn()
    const player = createMockPlayer()
    
    const { rerender } = render(
      <PlayerBoard 
        player={player} 
        isCurrentPlayer={true} 
        onCardClick={handleCardClick} 
      />
    )
    
    // Current player's cards should be clickable
    const cards = screen.getAllByTestId('card')
    cards.forEach(card => {
      expect(card).toHaveClass('clickable')
    })

    // Other player's cards should not be clickable
    rerender(
      <PlayerBoard 
        player={player} 
        isCurrentPlayer={false} 
        onCardClick={handleCardClick} 
      />
    )
    
    const otherPlayerCards = screen.getAllByTestId('card')
    otherPlayerCards.forEach(card => {
      expect(card).not.toHaveClass('clickable')
    })
  })

  it('should call onCardClick when card is clicked for current player', () => {
    const handleCardClick = vi.fn()
    const player = createMockPlayer()
    
    render(
      <PlayerBoard 
        player={player} 
        isCurrentPlayer={true} 
        onCardClick={handleCardClick} 
      />
    )
    
    const firstCard = screen.getAllByRole('button')[0]
    fireEvent.click(firstCard)
    
    expect(handleCardClick).toHaveBeenCalledWith(0)
  })

  it('should not call onCardClick for removed cards', () => {
    const handleCardClick = vi.fn()
    const player = createMockPlayer({
      cards: [
        {
          id: 'card-0',
          value: 5,
          isVisible: true,
          isRevealed: false,
          position: 0,
          isRemoved: true // This card is removed
        },
        ...Array.from({ length: 11 }, (_, i) => ({
          id: `card-${i + 1}`,
          value: i + 2,
          isVisible: true,
          isRevealed: false,
          position: i + 1,
          isRemoved: false
        }))
      ]
    })
    
    render(
      <PlayerBoard 
        player={player} 
        isCurrentPlayer={true} 
        onCardClick={handleCardClick} 
      />
    )
    
    const firstCard = screen.getAllByTestId('card')[0]
    fireEvent.click(firstCard)
    
    // Should not call handler for removed card
    expect(handleCardClick).not.toHaveBeenCalled()
    
    // But clicking the second card (not removed) should work
    const secondCard = screen.getAllByTestId('card')[1]
    fireEvent.click(secondCard)
    expect(handleCardClick).toHaveBeenCalledWith(1)
  })

  it('should not call onCardClick when no handler provided', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={true} />)
    
    const firstCard = screen.getAllByRole('button')[0]
    
    // Should not throw error when clicking without handler
    expect(() => fireEvent.click(firstCard)).not.toThrow()
  })

  it('should render cards in a grid layout', () => {
    const player = createMockPlayer()
    
    render(<PlayerBoard player={player} isCurrentPlayer={false} />)
    
    const cardsGrid = document.querySelector('.cards-grid')
    expect(cardsGrid).toBeInTheDocument()
  })

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const player = createMockPlayer({ name: 'Alice' })
      
      render(<PlayerBoard player={player} isCurrentPlayer={false} />)
      
      // Should have player info section
      expect(screen.getByText('Alice')).toBeInTheDocument()
      
      // Should have cards grid
      const cardsGrid = document.querySelector('.cards-grid')
      expect(cardsGrid).toBeInTheDocument()
    })

    it('should provide card accessibility through Card component', () => {
      const player = createMockPlayer()
      
      render(<PlayerBoard player={player} isCurrentPlayer={false} />)
      
      // All cards should be accessible
      const cards = screen.getAllByRole('button')
      expect(cards).toHaveLength(12)
      
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-label')
      })
    })
  })

  describe('card states', () => {
    it('should handle mix of visible and hidden cards', () => {
      const player = createMockPlayer({
        cards: [
          {
            id: 'card-0',
            value: 5,
            isVisible: true,
            isRevealed: false,
            position: 0
          },
          {
            id: 'card-1',
            value: 3,
            isVisible: false,
            isRevealed: false,
            position: 1
          }
        ]
      })
      
      render(<PlayerBoard player={player} isCurrentPlayer={false} />)
      
      const cards = screen.getAllByTestId('card')
      expect(cards).toHaveLength(2)
      
      // First card should show value, second should be hidden
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.queryByText('3')).not.toBeInTheDocument()
    })

    it('should handle removed cards', () => {
      const player = createMockPlayer({
        cards: [
          {
            id: 'card-0',
            value: 5,
            isVisible: true,
            isRevealed: false,
            position: 0,
            isRemoved: true
          }
        ]
      })
      
      render(<PlayerBoard player={player} isCurrentPlayer={false} />)
      
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('removed')
    })
  })
})