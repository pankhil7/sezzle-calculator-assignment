export interface CalculationResult {
  operation: string;
  operand_a: number;
  operand_b?: number;
  result: number;
}

export interface HistoryItem extends CalculationResult {
  id: number;
  created_at: string;
}

export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt' | 'percent';
