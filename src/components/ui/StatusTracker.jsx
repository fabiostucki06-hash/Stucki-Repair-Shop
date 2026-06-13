import { SO, SC } from '../../lib/constants.js'
import { IconCheck } from '../icons.jsx'

const STEP_COLORS = {
  offerte_erstellen:  '#5856D6',
  offerte_verschickt: '#C07000',
  arbeit:             '#007AFF',
  bezahlung:          '#CC2200',
  bezahlt:            '#248A3D',
}

export function StatusTracker({ status }) {
  const currentIndex = SO.indexOf(status)

  return (
    <div style={{ padding: '16px 20px 8px' }}>
      <div className="glass-panel" style={{ padding: '18px 16px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--label2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
          Auftragsstatus
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {SO.map((s, i) => {
            const done   = i < currentIndex
            const active = i === currentIndex
            const color  = done ? 'var(--blue)' : active ? STEP_COLORS[s] : 'rgba(0,0,0,0.15)'

            return (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {/* Connector + circle row */}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {i > 0 && (
                    <div style={{
                      flex: 1, height: 2.5, borderRadius: 2,
                      background: done ? 'var(--blue)' : 'rgba(0,0,0,0.10)',
                      transition: 'background 0.4s ease',
                    }} />
                  )}

                  <div style={{
                    width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                    background: done ? 'var(--blue)' : active ? STEP_COLORS[s] : 'rgba(255,255,255,0.6)',
                    border: `2px solid ${done ? 'var(--blue)' : active ? STEP_COLORS[s] : 'rgba(0,0,0,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? `0 0 0 4px ${STEP_COLORS[s]}33, 0 3px 10px ${STEP_COLORS[s]}44` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    backdropFilter: 'blur(12px)',
                  }}>
                    {done
                      ? <IconCheck size={12} style={{ color: '#fff' }} />
                      : <div style={{
                          width: 8, height: 8, borderRadius: 4,
                          background: active ? '#fff' : 'rgba(0,0,0,0.20)',
                          transition: 'background 0.3s',
                        }} />
                    }
                  </div>

                  {i < SO.length - 1 && (
                    <div style={{
                      flex: 1, height: 2.5, borderRadius: 2,
                      background: 'rgba(0,0,0,0.10)',
                    }} />
                  )}
                </div>

                {/* Label */}
                <div style={{
                  fontSize: 9.5, fontWeight: active ? 700 : 500, marginTop: 7,
                  textAlign: 'center', maxWidth: 54, lineHeight: 1.3, letterSpacing: '-0.1px',
                  color: done ? 'var(--blue)' : active ? STEP_COLORS[s] : 'var(--label3)',
                  transition: 'color 0.3s ease',
                }}>
                  {SC[s].short}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
