import { IconCloud } from './icons.jsx'

export function NavBar({ syncStatus, overdueCount, onLogout }) {
  const cloudClass = {
    idle:   'cloud-idle',
    saving: 'cloud-idle cloud-saving',
    ok:     'cloud-idle cloud-ok',
    error:  'cloud-idle cloud-error',
  }[syncStatus] || 'cloud-idle'

  const cloudTitle = {
    saving: 'Synchronisiert mit Cloud…',
    ok:     'Gespeichert ✓',
    error:  'Sync-Fehler',
  }[syncStatus] || 'Cloud-Sync'

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner" style={{ justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(145deg,#0A84FF,#0060CC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0,100,200,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M12 4a7 7 0 01-9.9 9.9L1 15a2 2 0 002.8 2.8l1.1-1.1A7 7 0 0114 5.5l-2.5 2.5 1.5 1.5 2.5-2.5z"
                stroke="white" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1, color: 'var(--label)' }}>
              Stucki Repair
            </div>
            <div style={{ fontSize: 11, color: 'var(--label2)', letterSpacing: '0.1px' }}>
              Werkstatt Management
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={cloudClass} title={cloudTitle}
            style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', borderRadius: 8 }}>
            <IconCloud />
          </div>
          {overdueCount > 0 && (
            <div style={{ background: 'var(--red)', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 13, fontWeight: 600 }}>
              {overdueCount}
            </div>
          )}
          <button onClick={onLogout} className="btn-plain" style={{ fontSize: 15 }}>Abmelden</button>
        </div>
      </div>
    </div>
  )
}
