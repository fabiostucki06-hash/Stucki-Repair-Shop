import { Badge } from '../components/ui/Badge.jsx'
import { IconChevron } from '../components/icons.jsx'
import { needsAttention, isOverdue, hoursSince, daysSince } from '../lib/utils.js'

export function Dashboard({ customers, orders, onOrderClick }) {
  const activeOrders = orders.filter((o) => o.status !== 'bezahlt')
  const todos        = orders.filter(needsAttention)

  const stats = [
    { label: 'Kunden',          v: customers.length,                              color: 'var(--blue)',   icon: '👤' },
    { label: 'Aktive Aufträge', v: activeOrders.length,                           color: 'var(--orange)', icon: '🔧' },
    { label: 'Nachzuhaken',     v: todos.length,                                  color: 'var(--red)',    icon: '⚠️' },
    { label: 'Bezahlt',         v: orders.filter((o) => o.status === 'bezahlt').length, color: 'var(--green)',  icon: '✅' },
  ]

  return (
    <div>
      <div style={{ padding: '16px 16px 0', marginBottom: 4 }}>
        <h1 className="sf-title1" style={{ letterSpacing: '-0.5px', paddingTop: 8 }}>Übersicht</h1>
        <p className="sf-footnote" style={{ color: 'var(--label2)', marginTop: 2 }}>Stucki Repair · Werkstatt Management</p>
      </div>

      <div style={{ padding: '8px 16px' }}>
        {/* Stat cards */}
        <div className="stat-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-number" style={{ color: s.color }}>{s.v}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Todos */}
        {todos.length > 0 && (
          <>
            <p className="section-header" style={{ paddingLeft: 0 }}>Nachzuhaken</p>
            <div className="inset-grouped-list">
              {todos.map((o) => {
                const c = customers.find((x) => x.id === o.customerId)
                return (
                  <div key={o.id} className="list-row" onClick={() => onOrderClick(o)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{c?.vorname || ''} {c?.nachname || ''}</div>
                      <div style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, marginTop: 1 }}>
                        {o.status === 'offerte_verschickt'
                          ? `${hoursSince(o.statusChangedAt)} Std. ohne Antwort`
                          : `${daysSince(o.statusChangedAt)} Tage offen`}
                      </div>
                    </div>
                    <Badge status={o.status} small />
                    <span style={{ color: 'var(--label3)' }}><IconChevron /></span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Active orders */}
        <p className="section-header" style={{ paddingLeft: 0 }}>Aktive Aufträge ({activeOrders.length})</p>
        {activeOrders.length === 0 ? (
          <div className="glass-panel" style={{ padding: 24, textAlign: 'center', color: 'var(--label3)', fontSize: 15 }}>
            Keine aktiven Aufträge.
          </div>
        ) : (
          <div className="inset-grouped-list">
            {activeOrders.slice(0, 10).map((o) => {
              const c  = customers.find((x) => x.id === o.customerId)
              const dv = daysSince(o.statusChangedAt)
              return (
                <div key={o.id} className="list-row" onClick={() => onOrderClick(o)}
                  style={{ background: isOverdue(o) ? 'rgba(255,59,48,0.06)' : 'transparent' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{c?.vorname || ''} {c?.nachname || ''}</div>
                    <div style={{ fontSize: 13, color: 'var(--label3)', marginTop: 1 }}>
                      #{o.orderNumber} · {dv < 1 ? 'heute' : `${dv}T`}
                    </div>
                  </div>
                  <Badge status={o.status} small />
                  <span style={{ color: 'var(--label3)', marginLeft: 4 }}><IconChevron /></span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
