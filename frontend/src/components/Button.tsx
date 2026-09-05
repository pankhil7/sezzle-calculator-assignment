interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'equals' | 'clear';
  wide?: boolean;
  disabled?: boolean;
}

const COLORS = {
  default: '#333',
  operator: '#f0a500',
  equals: '#f0a500',
  clear: '#a5a5a5',
}

export default function Button({ label, onClick, variant = 'default', wide = false, disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: COLORS[variant],
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontSize: 20,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '18px',
        gridColumn: wide ? 'span 4' : undefined,
        transition: 'opacity 0.1s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.opacity = '0.7' }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {label}
    </button>
  )
}
