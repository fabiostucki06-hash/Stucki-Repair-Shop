import { Badge } from '../components/ui/Badge.jsx'
import { IconChevron } from '../components/icons.jsx'
import { QUOTE_STATUSES } from '../lib/constants.js'
import { exportOfferteExcel } from '../lib/excel.js'
import { sortByName, formatDate } from '../lib/utils.js'

export function QuotesView({ offerten, customers, onQuoteClick, onNew }) {
  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="sf-title1" style={{ paddingTop: 8 }}>Offerten</h1>
        <button onClick={onNew} className="btn-tinted">+ Neue</button>
      </div>

      {!offerten.length && (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 16, color: 'var(--label2)' }}>Noch keine Offerten.</div>
        </div>
      )}

      {Object.entries(QUOTE_STATUSES).map(([st, info]) => {
        const grp = sortByName(offerten.filter((o) => o.status === st), customers)
        if (!grp.length) return null
        return (
          <div key={st}>
            <p className="section-header" style={{ paddingLeft: 0, color: info.color }}>{info.label} ({grp.length})</p>
            <div className="inset-grouped-list" style={{ marginBottom: 4 }}>
              {grp.map((off) => {
                const c = customers.find((x) => x.id === off.customerId)
                return (
                  <div key={off.id} className="list-row" onClick={() => onQuoteClick(off)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>Offerte #{off.offertNumber}</div>
                      <div style={{ fontSize: 13, color: 'var(--label2)', marginTop: 1 }}>{c ? `${c.vorname} ${c.nachname}` : 'Kein Kunde'}</div>
                      {off.totalBetrag && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginTop: 1 }}>CHF {off.totalBetrag}</div>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); exportOfferteExcel(off, c) }} className="excel-btn" title="Excel herunterladen">XLS</button>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 4 }}>
                      <div style={{ fontSize: 12, color: 'var(--label3)' }}>{formatDate(off.createdAt)}</div>
                      <span style={{ color: 'var(--label3)' }}><IconChevron /></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
