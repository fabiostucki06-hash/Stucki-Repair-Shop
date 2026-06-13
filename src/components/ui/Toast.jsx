import { createContext, useContext, useState, useEffect } from 'react'

const ToastCtx = createContext(null)
let _setter = null
let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  useEffect(() => { _setter = setToasts; return () => { _setter = null } }, [])

  function dismiss(id) {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, out: true } : t)))
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 260)
  }

  return (
    <>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}${t.out ? ' toast-out' : ''}`} role="status">
            <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.3 }}>{t.msg}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 16, padding: '0 2px' }}
            >✕</button>
          </div>
        ))}
      </div>
    </>
  )
}

export function showToast(msg, type = 'info') {
  if (!_setter) return
  const id   = ++_id
  const icons = { success: '✓', error: '✕', info: 'ℹ' }
  setTimeout(() => {
    _setter((ts) => [...ts, { id, msg, type, icon: icons[type] || icons.info, out: false }])
    setTimeout(() => {
      _setter((ts) => ts.map((t) => (t.id === id ? { ...t, out: true } : t)))
      setTimeout(() => _setter((ts) => ts.filter((t) => t.id !== id)), 260)
    }, 3600)
  }, 0)
}
