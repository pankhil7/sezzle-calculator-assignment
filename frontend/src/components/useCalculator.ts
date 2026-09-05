import { useState } from 'react'
import * as api from '../services/calculatorApi'
import { CalculationResult, Operation } from '../types'
import { toUserFriendlyError } from '../util/errorMessages'

const OP_MAP: Record<Operation, (a: number, b: number, persist?: boolean) => Promise<CalculationResult>> = {
  add:      (a, b, persist) => api.add(a, b, persist),
  subtract: (a, b, persist) => api.subtract(a, b, persist),
  multiply: (a, b, persist) => api.multiply(a, b, persist),
  divide:   (a, b, persist) => api.divide(a, b, persist),
  power:    (a, b, persist) => api.power(a, b, persist),
  sqrt:     (a, _, persist) => api.sqrt(a, persist),
  percent:  (a, b, persist) => api.percent(a, b, persist),
}

const OP_SYMBOLS: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
  percent: '%',
}

export interface CalculatorState {
  expression: string
  displayResult: string
  error: string
  isLoading: boolean
}

export interface CalculatorHandlers {
  handleNumber: (digit: string) => void
  handleOperator: (op: Operation) => void
  handleEquals: () => Promise<void>
  handleToggleSign: () => void
  handleClear: () => void
}

export function useCalculator(onCalculation: () => void): CalculatorState & CalculatorHandlers {
  const [currentInput, setCurrentInput] = useState('')
  const [previousInput, setPreviousInput] = useState('')
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [expression, setExpression] = useState('')
  const [error, setError] = useState('')
  const [justCalculated, setJustCalculated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastOperation, setLastOperation] = useState<{ op: Operation; b: number } | null>(null)

  const handleNumber = (digit: string) => {
    setError('')
    if (justCalculated) {
      setCurrentInput(digit === '.' ? '0.' : digit)
      setJustCalculated(false)
      return
    }
    if (digit === '.' && currentInput.includes('.')) return
    if (digit === '.' && currentInput === '') {
      setCurrentInput('0.')
      return
    }
    if (currentInput.replace('-', '').length >= 12) return
    setCurrentInput(prev => prev + digit)
  }

  // Evaluates a chain step via API — computes but does not persist to history
  const evaluatePending = async (a: number, b: number, op: Operation): Promise<string | null> => {
    setIsLoading(true)
    try {
      const res = await OP_MAP[op](a, b, false)
      return String(res.result)
    } catch (err: unknown) {
      setError(toUserFriendlyError(err))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleOperator = async (op: Operation) => {
    setError('')

    if (op === 'sqrt') {
      await handleSqrt()
      return
    }

    // User changed mind on operator — update silently
    if (selectedOperation && currentInput === '' && !justCalculated) {
      setSelectedOperation(op)
      setExpression(`${previousInput} ${OP_SYMBOLS[op]}`)
      return
    }

    // CHAINING: both operands ready → evaluate first, carry result forward
    if (selectedOperation && previousInput !== '' && currentInput !== '' && !justCalculated) {
      const result = await evaluatePending(
        parseFloat(previousInput),
        parseFloat(currentInput),
        selectedOperation
      )
      if (result === null) return
      setExpression(`${result} ${OP_SYMBOLS[op]}`)
      setPreviousInput(result)
      setSelectedOperation(op)
      setCurrentInput('')
      return
    }

    // After a completed calculation — use result as first operand
    if (justCalculated) {
      setPreviousInput(currentInput)
      setSelectedOperation(op)
      setExpression(`${currentInput} ${OP_SYMBOLS[op]}`)
      setJustCalculated(false)
      setCurrentInput('')
      return
    }

    // Normal: first operand entered, operator pressed
    const inputVal = currentInput || '0'
    setPreviousInput(inputVal)
    setSelectedOperation(op)
    setExpression(`${inputVal} ${OP_SYMBOLS[op]}`)
    setCurrentInput('')
  }

  const handleSqrt = async () => {
    const val = parseFloat(currentInput || '0')
    setIsLoading(true)
    try {
      const res = await api.sqrt(val)
      setExpression(`√(${val})`)
      setCurrentInput(String(res.result))
      setJustCalculated(true)
      setLastOperation(null)
      onCalculation()
    } catch (err: unknown) {
      setError(toUserFriendlyError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEquals = async () => {
    setError('')

    // Repeat = : reapply last operation to current result
    if (justCalculated && lastOperation) {
      const { op, b } = lastOperation
      const a = parseFloat(currentInput)
      setIsLoading(true)
      try {
        const res = await OP_MAP[op](a, b)
        setExpression(`${currentInput} ${OP_SYMBOLS[op]} ${b} =`)
        setCurrentInput(String(res.result))
        setJustCalculated(true)
        onCalculation()
      } catch (err: unknown) {
        setError(toUserFriendlyError(err))
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!selectedOperation || previousInput === '') return

    const a = parseFloat(previousInput)
    const b = parseFloat(currentInput || '0')
    setIsLoading(true)
    try {
      const res = await OP_MAP[selectedOperation](a, b)
      setLastOperation({ op: selectedOperation, b })
      setExpression(`${previousInput} ${OP_SYMBOLS[selectedOperation]} ${currentInput} =`)
      setCurrentInput(String(res.result))
      setPreviousInput('')
      setSelectedOperation(null)
      setJustCalculated(true)
      onCalculation()
    } catch (err: unknown) {
      setError(toUserFriendlyError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSign = () => {
    if (!currentInput || currentInput === '0') {
      setCurrentInput('-')
      return
    }
    setCurrentInput(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
  }

  const handleClear = () => {
    setCurrentInput('')
    setPreviousInput('')
    setSelectedOperation(null)
    setExpression('')
    setError('')
    setJustCalculated(false)
    setLastOperation(null)
  }

  return {
    expression,
    displayResult: currentInput,
    error,
    isLoading,
    handleNumber,
    handleOperator,
    handleEquals,
    handleToggleSign,
    handleClear,
  }
}
