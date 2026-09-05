import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import App from '../App'
import * as api from '../services/calculatorApi'

vi.mock('../services/calculatorApi')

describe('App', () => {
  it('renders Calculator and History panels', async () => {
    vi.mocked(api.getHistory).mockResolvedValue([])
    render(<App />)
    expect(screen.getByText('Calculator')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })
})
