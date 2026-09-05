import * as api from '../services/calculatorApi'
import { CalculationResult, Operation } from '../types'

export const OP_MAP: Record<Operation, (a: number, b: number, persist?: boolean) => Promise<CalculationResult>> = {
  add:      (a, b, persist) => api.add(a, b, persist),
  subtract: (a, b, persist) => api.subtract(a, b, persist),
  multiply: (a, b, persist) => api.multiply(a, b, persist),
  divide:   (a, b, persist) => api.divide(a, b, persist),
  power:    (a, b, persist) => api.power(a, b, persist),
  sqrt:     (a, _, persist) => api.sqrt(a, persist),
  percent:  (a, b, persist) => api.percent(a, b, persist),
}

export const OP_SYMBOLS: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
  percent: '%',
}
