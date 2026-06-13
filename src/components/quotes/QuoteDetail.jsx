import { useState } from 'react'
import { Sheet } from '../ui/Sheet.jsx'
import { QUOTE_STATUSES } from '../../lib/constants.js'
import { exportOfferteExcel } from '../../lib/excel.js'
import { formatDate } from '../../lib/utils.js'

export function QuoteDetail({ offerte, customer, onClose, onUpdate, onDelete }) {
  const [saving, setSaving] = useState(false)
  const sc        = QUOTE_STATUSES[offerte.status] || QUOTE_STATUSES.entwurf
  const isExpired = offerte.gueltigBis && new Date(offerte.gueltigBis) < new Date()

  async function setStatus(s) {
    setSaving(true)
    await onUpdate({ ...offerte, status: s })
    setSaving(false)
  }

  return (
    <Sheet title={`Offerte #${offerte.offertNumber}`} onClose={onClose} full>
      {/* Status header */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: sc.color, letterSpacing: '0.34px' }}>{sc.label}</div>
        {offerte.titel && <div style={{ fontSize: 15, color: 'var(--label2)', marginTop: 4 }}>{offerte.titel}</div>}
      </div>

      {isExpired && offerte.status === 'versendet' && (
        <div className="alert-banner alert-danger" style={{ marginBottom: 12 }}>
          <span>⚠️</span><span className="sf-subhead">Offerte abgelaufen</span>
        </div>
      )}

      {/* Status change */}
      <p className="section-header">Status ändern</p>
      <div className="h-scroll" style={{ marginBottom: 20 }}>
        {Object.entries(QUOTE_STATUSES).map(([s, info]) => (
          <button key={s} onClick={() => setStatus(s)} disabled={saving}
            className={`pill-btn ${offerte.status === s ? 'pill-btn-active' : 'pill-btn-inactive'}`}
            style={{ opacity: saving ? 0.5 : 1 }}>
            {info.label}
          </button>
        ))}
      </div>

      {/* Customer */}
      {customer && (
        <div className="inset-grouped-list" style={{ marginBottom: 16 }}>
          <div className="list-row" style={{ cursor: 'default' }}>
            <div style={{ flex: 1 }}>
              <div className="sf-headline">{customer.vorname} {customer.nachname}</div>
              <div className="sf-subhead" style={{ color: 'var(--label2)' }}>{customer.telefon} · {customer.kennzeichen}</div>
            </div>
          </div>
        </div>
      )}

      {offerte.gueltigBis && (
        <div className="sf-subhead" style={{ color: isExpired ? 'var(--red)' : 'var(--label2)', marginBottom: 12 }}>
          Gültig bis: {formatDate(offerte.gueltigBis)}{isExpired ? ' (abgelaufen)' : ''}
        </div>
      )}

      <div style={{ background: 'rgba(52,199,89,0.09)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, border: '0.5px solid rgba(52,199,89,0.22)' }}>
        <span style={{ fontSize: 16, color: 'var(--green)' }}>✓</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>
          Zahlungsfrist: {offerte.zahlungsFrist || 30} Tage netto
        </span>
      </div>

      {/* Positions */}
      <p className="section-header">Positionen</p>
      <div className="inset-grouped-list" style={{ marginBottom: 16 }}>
        {(offerte.positionen || []).map((pos, i) => (
          <div key={i} className="list-row" style={{ cursor: 'default' }}>
            <div style={{ flex: 1 }}>
              <div className="sf-subhead">{pos.beschreibung}</div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--label)' }}>
              CHF {(parseFloat(pos.menge || 1) * parseFloat(pos.preis || 0)).toFixed(2)}
            </div>
          </div>
        ))}
        <div className="list-row" style={{ cursor: 'default', background: 'rgba(0,122,255,0.06)' }}>
          <div className="sf-headline">Total</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--blue)' }}>
            CHF {parseFloat(offerte.totalBetrag || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {offerte.notizen && (
        <div style={{ background: 'var(--fill3)', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: 'var(--label2)', marginBottom: 16 }}>
          {offerte.notizen}
        </div>
      )}

      <button onClick={() => exportOfferteExcel(offerte, customer)} className="btn-system btn-green" style={{ marginBottom: 12 }}>
        Excel exportieren
      </button>
      <button onClick={async () => { if (window.confirm('Offerte löschen?')) await onDelete(offerte.id) }}
        className="btn-system btn-destructive">
        Offerte löschen
      </button>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--label3)', textAlign: 'center' }}>
        Erstellt: {formatDate(offerte.createdAt)} · Offerte #{offerte.offertNumber}
      </div>
    </Sheet>
  )
}
