interface DisplayProps {
  expression: string;
  result: string;
  error?: string;
  isLoading?: boolean;
}

function getFontSize(value: string): number {
  const len = value.length
  if (len <= 9) return 36
  if (len <= 13) return 28
  if (len <= 17) return 20
  return 14
}

export default function Display({ expression, result, error, isLoading = false }: DisplayProps) {
  const displayValue = result || '0'

  return (
    <div style={{
      background: '#1c1c1c',
      borderRadius: 8,
      padding: '16px 20px',
      marginBottom: 12,
      minHeight: 90,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      overflow: 'hidden',
    }}>
      <div style={{ color: '#aaa', fontSize: 14, minHeight: 20 }}>
        {isLoading ? 'Calculating…' : expression}
      </div>
      {error
        ? <div style={{ color: '#ff4444', fontSize: 20, fontWeight: 600, wordBreak: 'break-word', textAlign: 'right' }}>{error}</div>
        : <div style={{ color: isLoading ? '#888' : '#fff', fontSize: getFontSize(displayValue), fontWeight: 700, transition: 'font-size 0.15s ease, color 0.15s', wordBreak: 'break-all' }}>{displayValue}</div>
      }
    </div>
  )
}
