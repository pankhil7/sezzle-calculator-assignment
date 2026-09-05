import { useEffect, useState } from 'react'
import { getHistory, clearHistory } from '../services/calculatorApi'
import { HistoryItem } from '../types'

interface HistoryProps {
  refreshKey: number;
}

const OP_SYMBOLS: Record<string, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
  percent: '%',
}

function formatItem(item: HistoryItem): string {
  const sym = OP_SYMBOLS[item.operation] ?? item.operation
  if (item.operation === 'sqrt') {
    return `√(${item.operand_a}) = ${item.result}`
  }
  return `${item.operand_a} ${sym} ${item.operand_b} = ${item.result}`
}

export default function History({ refreshKey }: HistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([])

  const fetchHistory = async () => {
    try {
      const data = await getHistory()
      setItems(data)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    void fetchHistory()
  }, [refreshKey])

  const handleClear = async () => {
    try {
      await clearHistory()
      setItems([])
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 18 }}>History</h2>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              background: '#a5a5a5',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Clear History
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', margin: '20px 0' }}>No history yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(item => (
            <li
              key={item.id}
              style={{
                color: '#ddd',
                fontSize: 14,
                padding: '8px 0',
                borderBottom: '1px solid #444',
              }}
            >
              {formatItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
