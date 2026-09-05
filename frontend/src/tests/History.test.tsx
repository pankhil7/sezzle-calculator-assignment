import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import History from '../components/History'
import * as api from '../services/calculatorApi'

vi.mock('../services/calculatorApi')

const makeItem = (overrides = {}) => ({
  id: 1,
  operation: 'add',
  operand_a: 5,
  operand_b: 3,
  result: 8,
  created_at: '2024-01-01T00:00:00',
  ...overrides,
})

describe('History', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows empty state when no history', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('No history yet.')).toBeInTheDocument())
  })

  it('fetches and displays history items on mount', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([makeItem()])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('5 + 3 = 8')).toBeInTheDocument())
  })

  it('refetches when refreshKey changes', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([])
    const { rerender } = render(<History refreshKey={0} />)
    rerender(<History refreshKey={1} />)
    await waitFor(() => expect(api.getHistory).toHaveBeenCalledTimes(2))
  })

  it('formats sqrt item correctly', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([
      makeItem({ operation: 'sqrt', operand_a: 16, operand_b: undefined, result: 4 })
    ])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('√(16) = 4')).toBeInTheDocument())
  })

  it('formats subtract item correctly', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([
      makeItem({ operation: 'subtract', operand_a: 10, operand_b: 4, result: 6 })
    ])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('10 − 4 = 6')).toBeInTheDocument())
  })

  it('formats multiply item correctly', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([
      makeItem({ operation: 'multiply', operand_a: 6, operand_b: 7, result: 42 })
    ])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('6 × 7 = 42')).toBeInTheDocument())
  })

  it('formats divide item correctly', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([
      makeItem({ operation: 'divide', operand_a: 10, operand_b: 2, result: 5 })
    ])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('10 ÷ 2 = 5')).toBeInTheDocument())
  })

  it('formats power item correctly', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([
      makeItem({ operation: 'power', operand_a: 2, operand_b: 10, result: 1024 })
    ])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('2 ^ 10 = 1024')).toBeInTheDocument())
  })

  it('formats percent item correctly', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([
      makeItem({ operation: 'percent', operand_a: 10, operand_b: 200, result: 20 })
    ])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('10 % 200 = 20')).toBeInTheDocument())
  })

  it('shows Clear History button when items exist', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([makeItem()])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('Clear History')).toBeInTheDocument())
  })

  it('does not show Clear History button when empty', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([])
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.queryByText('Clear History')).not.toBeInTheDocument())
  })

  it('clears history when Clear History is clicked', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([makeItem()])
    vi.mocked(api.clearHistory).mockResolvedValue()
    render(<History refreshKey={0} />)
    await waitFor(() => screen.getByText('Clear History'))
    fireEvent.click(screen.getByText('Clear History'))
    await waitFor(() => expect(screen.getByText('No history yet.')).toBeInTheDocument())
  })

  it('handles getHistory failure silently', async () => {
    vi.mocked(api.getHistory).mockRejectedValue(new Error('network error'))
    render(<History refreshKey={0} />)
    await waitFor(() => expect(screen.getByText('No history yet.')).toBeInTheDocument())
  })

  it('handles clearHistory failure silently', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([makeItem()])
    vi.mocked(api.clearHistory).mockRejectedValue(new Error('network error'))
    render(<History refreshKey={0} />)
    await waitFor(() => screen.getByText('Clear History'))
    fireEvent.click(screen.getByText('Clear History'))
    // items remain since clear failed
    await waitFor(() => expect(screen.getByText('5 + 3 = 8')).toBeInTheDocument())
  })
})
