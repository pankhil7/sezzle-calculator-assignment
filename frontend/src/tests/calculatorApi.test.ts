import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { add, subtract, multiply, divide, power, sqrt, percent, getHistory, clearHistory } from '../services/calculatorApi'

vi.mock('axios')

describe('calculatorApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('add posts to /api/add with persist=true by default', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 8 } })
    const result = await add(5, 3)
    expect(axios.post).toHaveBeenCalledWith('/api/add', { a: 5, b: 3 }, undefined)
    expect(result).toEqual({ result: 8 })
  })

  it('add posts to /api/add with persist=false query param', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 8 } })
    await add(5, 3, false)
    expect(axios.post).toHaveBeenCalledWith('/api/add', { a: 5, b: 3 }, { params: { persist: false } })
  })

  it('subtract posts to /api/subtract', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 2 } })
    const result = await subtract(5, 3)
    expect(axios.post).toHaveBeenCalledWith('/api/subtract', { a: 5, b: 3 }, undefined)
    expect(result).toEqual({ result: 2 })
  })

  it('multiply posts to /api/multiply', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 15 } })
    const result = await multiply(5, 3)
    expect(axios.post).toHaveBeenCalledWith('/api/multiply', { a: 5, b: 3 }, undefined)
    expect(result).toEqual({ result: 15 })
  })

  it('divide posts to /api/divide', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 2 } })
    const result = await divide(6, 3)
    expect(axios.post).toHaveBeenCalledWith('/api/divide', { a: 6, b: 3 }, undefined)
    expect(result).toEqual({ result: 2 })
  })

  it('power posts to /api/power', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 8 } })
    const result = await power(2, 3)
    expect(axios.post).toHaveBeenCalledWith('/api/power', { a: 2, b: 3 }, undefined)
    expect(result).toEqual({ result: 8 })
  })

  it('sqrt posts only a to /api/sqrt', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 4 } })
    const result = await sqrt(16)
    expect(axios.post).toHaveBeenCalledWith('/api/sqrt', { a: 16 }, undefined)
    expect(result).toEqual({ result: 4 })
  })

  it('percent posts to /api/percent', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { result: 20 } })
    const result = await percent(10, 200)
    expect(axios.post).toHaveBeenCalledWith('/api/percent', { a: 10, b: 200 }, undefined)
    expect(result).toEqual({ result: 20 })
  })

  it('getHistory calls GET /api/history', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    const result = await getHistory()
    expect(axios.get).toHaveBeenCalledWith('/api/history')
    expect(result).toEqual([])
  })

  it('clearHistory calls DELETE /api/history', async () => {
    vi.mocked(axios.delete).mockResolvedValue({ data: {} })
    await clearHistory()
    expect(axios.delete).toHaveBeenCalledWith('/api/history')
  })
})
