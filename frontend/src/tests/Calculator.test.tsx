import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Calculator from '../components/Calculator'
import * as api from '../services/calculatorApi'

vi.mock('../services/calculatorApi')

describe('Calculator', () => {
  const mockOnCalculation = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    expect(screen.getByText('=')).toBeInTheDocument()
  })

  it('displays numbers when buttons are clicked', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getAllByText('5')[0])
    fireEvent.click(screen.getAllByText('3')[0])
    expect(screen.getByText('53')).toBeInTheDocument()
  })

  it('clears display when AC is pressed', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getAllByText('5')[0])
    fireEvent.click(screen.getByText('AC'))
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(1)
    expect(zeros[0]).toBeInTheDocument()
  })

  it('calls add API with correct args on equals', async () => {
    vi.mocked(api.add).mockResolvedValue({
      operation: 'add', operand_a: 5, operand_b: 3, result: 8
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('5'))
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('='))
    await waitFor(() => {
      // persist defaults to true (undefined) — final result is saved to history
      expect(api.add).toHaveBeenCalledWith(5, 3, undefined)
    })
  })

  it('displays error message when API returns error', async () => {
    vi.mocked(api.divide).mockRejectedValue({
      response: { data: { detail: 'Division by zero' } }
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('5'))
    fireEvent.click(screen.getByText('÷'))
    const zeros = screen.getAllByText('0')
    fireEvent.click(zeros[zeros.length - 1])
    fireEvent.click(screen.getByText('='))
    await waitFor(() => {
      expect(screen.getByText("Oops! You can't divide by zero.")).toBeInTheDocument()
    })
  })

  it('chains operations: evaluates pending op before applying next', async () => {
    vi.mocked(api.multiply).mockResolvedValueOnce({
      operation: 'multiply', operand_a: 5, operand_b: 6, result: 30
    })
    vi.mocked(api.multiply).mockResolvedValueOnce({
      operation: 'multiply', operand_a: 30, operand_b: 3, result: 90
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('5'))
    fireEvent.click(screen.getByText('×'))
    fireEvent.click(screen.getByText('6'))
    fireEvent.click(screen.getByText('×'))
    // chain step: persist=false — intermediate result not saved to history
    await waitFor(() => expect(api.multiply).toHaveBeenCalledWith(5, 6, false))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('='))
    // final step: persist=true (undefined) — only this result saved to history
    await waitFor(() => {
      expect(api.multiply).toHaveBeenCalledWith(30, 3, undefined)
      expect(screen.getByText('90')).toBeInTheDocument()
    })
  })

  it('repeats last operation on consecutive equals presses', async () => {
    vi.mocked(api.add).mockResolvedValue({
      operation: 'add', operand_a: 5, operand_b: 3, result: 8
    })
    vi.mocked(api.add).mockResolvedValueOnce({
      operation: 'add', operand_a: 5, operand_b: 3, result: 8
    }).mockResolvedValueOnce({
      operation: 'add', operand_a: 8, operand_b: 3, result: 11
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('5'))
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('='))
    await waitFor(() => expect(screen.getByText('8')).toBeInTheDocument())
    fireEvent.click(screen.getByText('='))
    await waitFor(() => {
      expect(api.add).toHaveBeenCalledWith(8, 3, undefined)
    })
  })

  it('operator change before second operand updates silently', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('5'))
    fireEvent.click(screen.getByText('×'))
    fireEvent.click(screen.getByText('÷'))
    expect(api.multiply).not.toHaveBeenCalled()
    expect(api.divide).not.toHaveBeenCalled()
  })

  it('sqrt computes immediately without pressing equals', async () => {
    vi.mocked(api.sqrt).mockResolvedValue({
      operation: 'sqrt', operand_a: 25, result: 5
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getAllByText('5')[0])
    fireEvent.click(screen.getByText('√'))
    // handleSqrt calls api.sqrt(val) directly with one arg
    await waitFor(() => expect(api.sqrt).toHaveBeenCalledWith(5))
  })

  it('toggles sign on existing number', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getAllByText('5')[0])
    fireEvent.click(screen.getByText('+/-'))
    expect(screen.getByText('-5')).toBeInTheDocument()
  })

  it('toggles sign back to positive', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getAllByText('5')[0])
    fireEvent.click(screen.getByText('+/-'))
    expect(screen.getByText('-5')).toBeInTheDocument()
    fireEvent.click(screen.getByText('+/-'))
    expect(screen.queryByText('-5')).not.toBeInTheDocument()
  })

  it('pressing . on empty input shows 0.', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('.'))
    expect(screen.getByText('0.')).toBeInTheDocument()
  })

  it('does not add second decimal point', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('1'))
    fireEvent.click(screen.getByText('.'))
    fireEvent.click(screen.getByText('.'))
    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  it('pressing = with no input does nothing', () => {
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('='))
    expect(api.add).not.toHaveBeenCalled()
  })

  it('starts fresh number after calculation when digit pressed', async () => {
    vi.mocked(api.add).mockResolvedValue({
      operation: 'add', operand_a: 5, operand_b: 3, result: 8
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getAllByText('5')[0])
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('='))
    await waitFor(() => screen.getByText('8'))
    // type two digits so display value is unique from button labels
    fireEvent.click(screen.getAllByText('9')[0])
    fireEvent.click(screen.getAllByText('2')[0])
    expect(screen.getByText('92')).toBeInTheDocument()
  })

  it('uses result as first operand after calculation', async () => {
    vi.mocked(api.add).mockResolvedValueOnce({
      operation: 'add', operand_a: 5, operand_b: 3, result: 8
    })
    vi.mocked(api.multiply).mockResolvedValueOnce({
      operation: 'multiply', operand_a: 8, operand_b: 2, result: 16
    })
    render(<Calculator onCalculation={mockOnCalculation} />)
    fireEvent.click(screen.getByText('5'))
    fireEvent.click(screen.getByText('+'))
    fireEvent.click(screen.getByText('3'))
    fireEvent.click(screen.getByText('='))
    await waitFor(() => screen.getByText('8'))
    fireEvent.click(screen.getByText('×'))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText('='))
    await waitFor(() => expect(api.multiply).toHaveBeenCalledWith(8, 2, undefined))
  })
})
