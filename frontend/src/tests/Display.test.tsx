import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Display from '../components/Display'

describe('Display', () => {
  it('renders expression and result', () => {
    render(<Display expression="5 + 3" result="8" />)
    expect(screen.getByText('5 + 3')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows error in place of result', () => {
    render(<Display expression="" result="" error="Division by zero" />)
    expect(screen.getByText('Division by zero')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows 0 when result is empty and no error', () => {
    render(<Display expression="" result="" />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows Calculating… when loading', () => {
    render(<Display expression="5 +" result="" isLoading={true} />)
    expect(screen.getByText('Calculating…')).toBeInTheDocument()
  })

  it('shrinks font for long results (10+ chars)', () => {
    render(<Display expression="" result="12345678901" />)
    expect(screen.getByText('12345678901')).toBeInTheDocument()
  })

  it('shrinks font further for very long results (14+ chars)', () => {
    render(<Display expression="" result="12345678901234" />)
    expect(screen.getByText('12345678901234')).toBeInTheDocument()
  })

  it('uses smallest font for extremely long results (18+ chars)', () => {
    render(<Display expression="" result="123456789012345678" />)
    expect(screen.getByText('123456789012345678')).toBeInTheDocument()
  })
})
