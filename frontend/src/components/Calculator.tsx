import Display from './Display'
import Button from './Button'
import { Operation } from '../types'
import { useCalculator } from './useCalculator'

interface CalculatorProps {
  onCalculation: () => void;
}

export default function Calculator({ onCalculation }: CalculatorProps) {
  const {
    expression,
    displayResult,
    error,
    isLoading,
    handleNumber,
    handleOperator,
    handleEquals,
    handleToggleSign,
    handleClear,
  } = useCalculator(onCalculation)

  const btn = (label: string, onClick: () => void, variant?: 'default' | 'operator' | 'equals' | 'clear', wide?: boolean) => (
    <Button label={label} onClick={onClick} variant={variant} wide={wide} disabled={isLoading} />
  )

  return (
    <div style={{ opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
      <Display expression={expression} result={displayResult} error={error} isLoading={isLoading} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {/* Row 1 */}
        {btn('AC', handleClear, 'clear')}
        {btn('√', () => handleOperator('sqrt' as Operation), 'operator')}
        {btn('%', () => handleOperator('percent' as Operation), 'operator')}
        {btn('÷', () => handleOperator('divide' as Operation), 'operator')}

        {/* Row 2 */}
        {btn('7', () => handleNumber('7'))}
        {btn('8', () => handleNumber('8'))}
        {btn('9', () => handleNumber('9'))}
        {btn('×', () => handleOperator('multiply' as Operation), 'operator')}

        {/* Row 3 */}
        {btn('4', () => handleNumber('4'))}
        {btn('5', () => handleNumber('5'))}
        {btn('6', () => handleNumber('6'))}
        {btn('−', () => handleOperator('subtract' as Operation), 'operator')}

        {/* Row 4 */}
        {btn('1', () => handleNumber('1'))}
        {btn('2', () => handleNumber('2'))}
        {btn('3', () => handleNumber('3'))}
        {btn('+', () => handleOperator('add' as Operation), 'operator')}

        {/* Row 5 */}
        {btn('+/-', handleToggleSign, 'clear')}
        {btn('0', () => handleNumber('0'))}
        {btn('.', () => handleNumber('.'))}
        {btn('^', () => handleOperator('power' as Operation))}

        {/* Row 6 */}
        {btn('=', handleEquals, 'equals', true)}
      </div>
    </div>
  )
}
