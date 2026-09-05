import axios from 'axios'
import { CalculationResult, HistoryItem } from '../types'
import log from './logger'

const BASE = '/api'

// Global logging — runs for every request/response automatically
axios.interceptors.request.use(req => {
  log.info(`[API] → ${req.method?.toUpperCase()} ${req.url}`, req.data)
  return req
})

axios.interceptors.response.use(
  res => {
    log.info(`[API] ← ${res.status} ${res.config.url}`, res.data)
    return res
  },
  err => {
    log.error(`[API] ✗ ${err.config?.url}`, err.response?.data)
    return Promise.reject(err)
  }
)

function persistParam(persist: boolean) {
  return persist ? undefined : { params: { persist: false } }
}

// Calculator operations
export async function add(a: number, b: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/add`, { a, b }, persistParam(persist))
  return data
}

export async function subtract(a: number, b: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/subtract`, { a, b }, persistParam(persist))
  return data
}

export async function multiply(a: number, b: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/multiply`, { a, b }, persistParam(persist))
  return data
}

export async function divide(a: number, b: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/divide`, { a, b }, persistParam(persist))
  return data
}

export async function power(a: number, b: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/power`, { a, b }, persistParam(persist))
  return data
}

export async function sqrt(a: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/sqrt`, { a }, persistParam(persist))
  return data
}

export async function percent(a: number, b: number, persist = true): Promise<CalculationResult> {
  const { data } = await axios.post(`${BASE}/percent`, { a, b }, persistParam(persist))
  return data
}

// History
export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await axios.get(`${BASE}/history`)
  return data
}

export async function clearHistory(): Promise<void> {
  await axios.delete(`${BASE}/history`)
}
