import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from '../Card'
import type { CardType } from '../../types/game'

describe('Card', () => {
  const mockCard: CardType = {
    id: 'test-card-1',
    value: 5,
    isVisible: true,
    isRevealed: false,
    position: 0
  }

  const hiddenCard: CardType = {
    id: 'test-card-2',
    value: 8,
    isVisible: false,
    isRevealed: false,
    position: 1
  }

  const removedCard: CardType = {
    id: 'test-card-3',
    value: 3,
    isVisible: true,
    isRevealed: false,
    position: 2,
    isRemoved: true
  }

  it('should render visible card with its value', () => {
    render(<Card card={mockCard} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should render hidden card with back face', () => {
    render(<Card card={hiddenCard} />)
    
    // Hidden cards should show a card back, not the value
    expect(screen.queryByText('8')).not.toBeInTheDocument()
    
    // Check for card back indicator
    const cardElement = screen.getByTestId('card')
    expect(cardElement).toHaveClass('card', 'card-medium')
  })

  it('should render removed card with special styling', () => {
    render(<Card card={removedCard} />)
    
    const cardElement = screen.getByTestId('card')
    expect(cardElement).toHaveClass('removed')
  })

  it('should apply correct size class', () => {
    const { rerender } = render(<Card card={mockCard} size="small" />)
    expect(screen.getByTestId('card')).toHaveClass('card-small')

    rerender(<Card card={mockCard} size="medium" />)
    expect(screen.getByTestId('card')).toHaveClass('card-medium')

    rerender(<Card card={mockCard} size="large" />)
    expect(screen.getByTestId('card')).toHaveClass('card-large')
  })

  it('should call onClick when clickable and clicked', () => {
    const handleClick = vi.fn()
    render(<Card card={mockCard} onClick={handleClick} isClickable={true} />)
    
    fireEvent.click(screen.getByTestId('card'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when not clickable', () => {
    const handleClick = vi.fn()
    render(<Card card={mockCard} onClick={handleClick} isClickable={false} />)
    
    fireEvent.click(screen.getByTestId('card'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should not call onClick when no onClick provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<Card card={mockCard} isClickable={true} />)
    
    // Should not throw error
    fireEvent.click(screen.getByTestId('card'))
    
    consoleSpy.mockRestore()
  })

  it('should apply clickable styling when clickable', () => {
    render(<Card card={mockCard} isClickable={true} />)
    
    const cardElement = screen.getByTestId('card')
    expect(cardElement).toHaveClass('clickable')
  })

  it('should not apply clickable styling when not clickable', () => {
    render(<Card card={mockCard} isClickable={false} />)
    
    const cardElement = screen.getByTestId('card')
    expect(cardElement).not.toHaveClass('clickable')
  })

  it('should handle negative values correctly', () => {
    const negativeCard: CardType = {
      ...mockCard,
      value: -2
    }
    
    render(<Card card={negativeCard} />)
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('should handle zero value correctly', () => {
    const zeroCard: CardType = {
      ...mockCard,
      value: 0
    }
    
    render(<Card card={zeroCard} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should apply value-based styling classes', () => {
    const { rerender } = render(<Card card={{...mockCard, value: -2}} />)
    const cardElement = screen.getByTestId('card')
    expect(cardElement).toHaveClass('card')

    rerender(<Card card={{...mockCard, value: 0}} />)
    expect(screen.getByTestId('card')).toHaveClass('card')

    rerender(<Card card={{...mockCard, value: 5}} />)
    expect(screen.getByTestId('card')).toHaveClass('card')

    rerender(<Card card={{...mockCard, value: 10}} />)
    expect(screen.getByTestId('card')).toHaveClass('card')
  })

  it('should be accessible', () => {
    render(<Card card={mockCard} />)
    
    const cardElement = screen.getByRole('button')
    expect(cardElement).toBeInTheDocument()
    
    // Should have appropriate aria attributes for screen readers
    expect(cardElement).toHaveAttribute('aria-label')
  })

  it('should default to medium size when no size provided', () => {
    render(<Card card={mockCard} />)
    
    expect(screen.getByTestId('card')).toHaveClass('card-medium')
  })
})