import { useState } from 'react'
import { auth } from '../lib/supabase.js'
import { Spinner } from './ui/Spinner.jsx'
import { IconStar } from './icons.jsx'

export function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin() {
    if (!email.trim() || !password.trim()) { setError('Bitte alle Felder ausfüllen.'); return }
    setLoading(true); setError('')
    try {
      const res = await auth.signIn(email.trim().toLowerCase(), password)
      if (res.error || !res.access_token) {
        setError(res.error?.message || 'E-Mail oder Passwort falsch.')
        setLoading(false); return
      }
      localStorage.setItem('garage_token', res.access_token)
      localStorage.setItem('garage_email', email.trim().toLowerCase())
      onLogin(res.access_token, email.trim().toLowerCase())
    } catch {
      setError('Verbindungsfehler')
    }
    setLoading(false)
  }

  const onKey = (e) => e.key === 'Enter' && handleLogin()

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'linear-gradient(145deg,#0A84FF,#0060CC)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 18,
            boxShadow: '0 8px 24px rgba(0,96,204,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <svg width={36} height={36} viewBox="0 0 20 20" fill="none">
              <path d="M12 4a7 7 0 01-9.9 9.9L1 15a2 2 0 002.8 2.8l1.1-1.1A7 7 0 0114 5.5l-2.5 2.5 1.5 1.5 2.5-2.5z"
                stroke="white" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="sf-title1" style={{ marginBottom: 5, letterSpacing: '-0.5px' }}>Stucki Repair</h1>
          <p className="sf-callout" style={{ color: 'var(--label2)' }}>Werkstatt Management</p>
        </div>

        {error && (
          <div className="alert-banner alert-danger" style={{ marginBottom: 16 }}>
            <span>⚠️</span>
            <span className="sf-subhead">{error}</span>
          </div>
        )}

        <div className="form-section" style={{ marginBottom: 16 }}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail" className="text-field" onKeyDown={onKey}
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort" className="text-field text-field-last" onKeyDown={onKey}
          />
        </div>

        <button onClick={handleLogin} disabled={loading} className="btn-system">
          {loading ? <Spinner size={20} color="rgba(255,255,255,0.7)" /> : 'Anmelden'}
        </button>
      </div>
    </div>
  )
}
