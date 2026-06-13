import { useState } from 'react'
import { Badge } from '../components/ui/Badge.jsx'
import { IconChevron, IconX } from '../components/icons.jsx'
import { getActiveStatus } from '../lib/utils.js'

export function CustomersView({ customers, orders, onCustomerClick }) {
  const [search,   setSearch]   = useState('')
  const [filterK,  setFilterK]  = useState('all')

  const filtered = customers
    .filter((c) => {
      const q  = search.toLowerCase()
      const m  = !q || `${c.vorname} ${c.nachname} ${c.telefon} ${c.kennzeichen}`.toLowerCase().includes(q)
      const as = getActiveStatus(orders, c.id)
      if (filterK === 'active'   && !as) return false
      if (filterK === 'inactive' &&  as) return false
      return m
    })
    .sort((a, b) => {
      const na = `${a.nachname} ${a.vorname}`.toLowerCase()
      const nb = `${b.nachname} ${b.vorname}`.toLowerCase()
      return na < nb ? -1 : na > nb ? 1 : 0
    })

  function initials(c) {
    return (c.vorname[0] || '').toUpperCase() + (c.nachname[0] || '').toUpperCase()
  }

  return (
    <div>
      <div style={{ padding: '16px 16px 0' }}>
        <h1 className="sf-title1" style={{ marginBottom: 8, paddingTop: 8 }}>Kunden</h1>
      </div>

      <div className="search-bar-wrap">
        <div className="search-bar">
          <span style={{ color: 'var(--label2)', fontSize: 16 }}>⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suche" autoComplete="off" />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--label3)', padding: 0, display: 'flex' }}>
              <IconX />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div className="seg-ctrl" style={{ width: '100%', marginBottom: 12 }}>
          {[['all', 'Alle'], ['active', 'Aktiv'], ['inactive', 'Inaktiv']].map(([f, l]) => (
            <button key={f} className={`seg-item${filterK === f ? ' active' : ''}`} onClick={() => setFilterK(f)} style={{ flex: 1 }}>
              {l}
            </button>
          ))}
        </div>

        {!filtered.length && (
          <div className="glass-panel" style={{ padding: 32, textAlign: 'center', color: 'var(--label3)' }}>
            Keine Kunden gefunden.
          </div>
        )}

        <div className="inset-grouped-list">
          {filtered.map((c) => {
            const as = getActiveStatus(orders, c.id)
            return (
              <div key={c.id} className="list-row" onClick={() => onCustomerClick(c)}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18, flexShrink: 0,
                  background: 'linear-gradient(to bottom,#54a4ff,#007aff)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5),0 2px 6px rgba(0,86,179,0.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff',
                  textShadow: '0 -1px 0 rgba(0,0,0,0.25)',
                }}>
                  {initials(c)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{c.vorname} {c.nachname}</div>
                  <div style={{ fontSize: 13, color: 'var(--label2)', marginTop: 1 }}>{c.telefon}</div>
                  <div style={{ fontSize: 12, color: 'var(--label3)', marginTop: 1 }}>{c.kennzeichen}{c.marke ? ' · ' + c.marke : ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  {as ? <Badge status={as} small /> : <span style={{ fontSize: 11, color: 'var(--label3)' }}>Inaktiv</span>}
                  <span style={{ color: 'var(--label3)' }}><IconChevron /></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
