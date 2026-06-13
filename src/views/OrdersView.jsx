import { Badge } from '../components/ui/Badge.jsx'
import { IconChevron } from '../components/icons.jsx'
import { SC, SO } from '../lib/constants.js'
import { isOverdue, daysSince, sortByName, formatDate } from '../lib/utils.js'
import { exportOrderExcel } from '../lib/excel.js'

export function OrdersView({ orders, customers, onOrderClick }) {
  const active = SO.filter((s) => s !== 'bezahlt')
  const done   = orders.filter((o) => o.status === 'bezahlt').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <h1 className="sf-title1" style={{ marginBottom: 12, paddingTop: 8 }}>Aufträge</h1>

      {active.map((s) => {
        const grp = sortByName(orders.filter((o) => o.status === s), customers)
        if (!grp.length) return null
        return (
          <div key={s}>
            <p className="section-header" style={{ paddingLeft: 0 }}>{SC[s].label} ({grp.length})</p>
            <div className="inset-grouped-list" style={{ marginBottom: 4 }}>
              {grp.map((o) => {
                const c  = customers.find((x) => x.id === o.customerId)
                const ov = isOverdue(o)
                const dv = daysSince(o.statusChangedAt)
                return (
                  <div key={o.id} className="list-row" onClick={() => onOrderClick(o)}
                    style={{ background: ov ? 'rgba(255,59,48,0.06)' : 'transparent' }}>
                    <div style={{ flex: 1 }}>
                      {ov && <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginBottom: 2 }}>Frist überschritten</div>}
                      <div style={{ fontWeight: 600, fontSize: 16 }}>#{o.orderNumber} – {c?.vorname || ''} {c?.nachname || ''}</div>
                      <div style={{ fontSize: 13, color: 'var(--label3)', marginTop: 1 }}>{c?.kennzeichen || ''} · {dv < 1 ? 'heute' : `${dv}T`}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); exportOrderExcel(o, c) }} className="excel-btn" title="Excel herunterladen">XLS</button>
                    <span style={{ color: 'var(--label3)', marginLeft: 4 }}><IconChevron /></span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {done.length > 0 && (
        <details style={{ marginBottom: 8 }}>
          <summary style={{ padding: '8px 0', cursor: 'pointer', color: 'var(--green)', fontWeight: 600, fontSize: 15, listStyle: 'none', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ▶ Bezahlt ({done.length})
          </summary>
          <div className="inset-grouped-list" style={{ marginTop: 8 }}>
            {done.map((o) => {
              const c = customers.find((x) => x.id === o.customerId)
              return (
                <div key={o.id} className="list-row" onClick={() => onOrderClick(o)} style={{ opacity: 0.65 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>#{o.orderNumber} – {c?.vorname || ''} {c?.nachname || ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--label3)' }}>{formatDate(o.createdAt)}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); exportOrderExcel(o, c) }} className="excel-btn" title="Excel herunterladen">XLS</button>
                  <span style={{ color: 'var(--label3)' }}><IconChevron /></span>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {!orders.length && (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--label3)' }}>Noch keine Aufträge.</div>
      )}
    </div>
  )
}
