import { useState } from 'react'
import Calculator from './components/Calculator'
import History from './components/History'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#2d2d2d',
          borderRadius: 16,
          padding: 20,
          width: '100%',
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ color: '#fff', margin: '0 0 16px', fontSize: 18 }}>Calculator</h2>
          <Calculator onCalculation={() => setRefreshKey(k => k + 1)} />
        </div>
        <div style={{
          background: '#2d2d2d',
          borderRadius: 16,
          padding: 20,
          width: '100%',
          maxWidth: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          maxHeight: 500,
          overflowY: 'auto',
        }}>
          <History refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
