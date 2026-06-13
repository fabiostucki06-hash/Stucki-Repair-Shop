import { useState } from 'react'
import { Sheet } from '../ui/Sheet.jsx'
import { Badge } from '../ui/Badge.jsx'
import { Spinner } from '../ui/Spinner.jsx'
import { StatusTracker } from '../ui/StatusTracker.jsx'
import { IconPlus, IconX, IconCheck } from '../icons.jsx'
import { SO, SC } from '../../lib/constants.js'
import { exportOrderExcel } from '../../lib/excel.js'
import { isOverdue, daysSince, hoursSince, formatDate } from '../../lib/utils.js'

export function OrderDetail({ order, customer, onClose, onUpdate, onDelete }) {
  const [edit,          setEdit]          = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [status,        setStatus]        = useState(order.status)
  const [bs,            setBs]            = useState(order.beanstandungen || [''])
  const [notizen,       setNotizen]       = useState(order.notizen || '')
  const [items,         setItems]         = useState(order.offertItems || [])
  const [newItem,       setNewItem]       = useState('')
  const [offB,          setOffB]          = useState(order.offertBetrag || '')
  const [recB,          setRecB]          = useState(order.rechnungsBetrag || '')
  const [zahlungsFrist, setZahlungsFrist] = useState(order.zahlungsFrist || '30')
  const [editCust,      setEditCust]      = useState(false)
  const [cv,  setCv]  = useState(customer?.vorname || '')
  const [cn,  setCn]  = useState(customer?.nachname || '')
  const [ct,  setCt]  = useState(customer?.telefon || '')
  const [ck,  setCk]  = useState(customer?.kennzeichen || '')
  const [cm,  setCm]  = useState(customer?.modell || '')
  const [cma, setCma] = useState(customer?.marke || '')

  const ov  = isOverdue({ ...order, status })
  const d   = daysSince(order.statusChangedAt)
  const hh  = hoursSince(order.statusChangedAt)
  const showChecklist = ['arbeit', 'bezahlung', 'bezahlt'].includes(status)

  const addB = () => setBs((p) => [...p, ''])
  const updB = (i, v) => setBs((p) => { const n = [...p]; n[i] = v; return n })
  const remB = (i) => setBs((p) => p.filter((_, j) => j !== i))

  const addItem = () => { if (newItem.trim()) { setItems((p) => [...p, { text: newItem.trim(), checked: false }]); setNewItem('') } }
  const togItem = (i) => setItems((p) => p.map((x, j) => j === i ? { ...x, checked: !x.checked } : x))
  const remItem = (i) => setItems((p) => p.filter((_, j) => j !== i))

  async function save() {
    setSaving(true)
    const upd = { ...order, status, beanstandungen: bs.filter((x) => x.trim()), notizen, offertItems: items, offertBetrag: offB, rechnungsBetrag: recB, zahlungsFrist }
    if (status !== order.status) upd.statusChangedAt = new Date().toISOString()
    const cp = editCust ? { vorname: cv, nachname: cn, telefon: ct, kennzeichen: ck, modell: cm, marke: cma } : null
    await onUpdate(upd, cp)
    setSaving(false); setEdit(false); setEditCust(false)
  }

  async function saveStatus(ns) {
    setStatus(ns); setSaving(true)
    const upd = { ...order, status: ns, beanstandungen: bs.filter((x) => x.trim()), notizen, offertItems: items, offertBetrag: offB, rechnungsBetrag: recB, zahlungsFrist, statusChangedAt: new Date().toISOString() }
    await onUpdate(upd, null)
    setSaving(false)
  }

  const inp2 = { display: 'block', width: '100%', background: 'var(--fill3)', border: 'none', borderRadius: 9, padding: '9px 12px', fontSize: 16, color: 'var(--label)', outline: 'none' }

  return (
    <Sheet
      title={`Auftrag #${order.orderNumber}`}
      onClose={onClose}
      full
      barLeft={
        <div style={{ minWidth: 60, display: 'flex', alignItems: 'center', gap: 6 }}>
          {edit && (
            <button onClick={save} disabled={saving} className="bar-btn" style={{ color: 'var(--blue)', fontWeight: 600 }}>
              {saving ? '…' : 'Sichern'}
            </button>
          )}
        </div>
      }
      barRight={
        <div style={{ display: 'flex', gap: 4, minWidth: 60, justifyContent: 'flex-end' }}>
          {!edit
            ? <button onClick={() => setEdit(true)} className="bar-btn">Bearbeiten</button>
            : <button onClick={() => { setEdit(false); setEditCust(false) }} className="bar-btn" style={{ color: 'var(--label2)' }}>Abbrechen</button>
          }
        </div>
      }
    >
      {/* Overdue alert */}
      {ov && (
        <div className="alert-banner alert-danger" style={{ marginBottom: 12 }}>
          <span>⚠️</span>
          <span className="sf-subhead">{status === 'offerte_verschickt' ? 'Offerte >48h ohne Antwort' : 'Zahlung überfällig'}</span>
        </div>
      )}

      {/* Visual status tracker */}
      <StatusTracker status={status} />

      {/* Status change pills */}
      <div style={{ padding: '0 16px 4px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--label2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Status ändern
        </span>
        {saving && <Spinner size={14} />}
      </div>
      <div className="h-scroll" style={{ padding: '0 16px', marginBottom: 20 }}>
        {SO.map((s) => (
          <button key={s} onClick={() => saveStatus(s)} disabled={saving}
            className={`pill-btn ${status === s ? 'pill-btn-active' : 'pill-btn-inactive'}`}
            style={{ opacity: saving ? 0.5 : 1 }}>
            {SC[s].short}
          </button>
        ))}
      </div>

      {/* Customer */}
      <div className="inset-grouped-list" style={{ marginBottom: 16 }}>
        <div className="list-row" style={{ cursor: 'default' }}>
          <div style={{ flex: 1 }}>
            <div className="sf-headline">{customer?.vorname || ''} {customer?.nachname || ''}</div>
            <div className="sf-subhead" style={{ color: 'var(--label2)' }}>{customer?.telefon} · {customer?.kennzeichen}</div>
          </div>
          {edit && (
            <button onClick={() => setEditCust((p) => !p)}
              style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '4px 8px' }}>
              {editCust ? 'Fertig' : 'Bearbeiten'}
            </button>
          )}
        </div>
        {editCust && edit && (
          <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['vorname', 'Vorname', cv, setCv], ['nachname', 'Nachname', cn, setCn],
              ['telefon', 'Telefon', ct, setCt], ['kennzeichen', 'Kennzeichen', ck, setCk],
              ['marke', 'Marke', cma, setCma], ['modell', 'Modell', cm, setCm]].map(([k, ph, v, setter]) => (
              <input key={k} value={v} onChange={(e) => setter(e.target.value)} placeholder={ph} style={inp2} />
            ))}
          </div>
        )}
      </div>

      {/* Time info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 16 }}>
        <Badge status={status} />
        <span style={{ fontSize: 13, color: 'var(--label3)' }}>{d < 1 ? `${hh} Std.` : `${d} Tage`}</span>
      </div>

      {/* Beanstandungen */}
      <p className="section-header">Beanstandungen</p>
      {edit ? (
        <div style={{ marginBottom: 20 }}>
          {bs.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input value={b} onChange={(e) => updB(i, e.target.value)} placeholder={`Beanstandung ${i + 1}`}
                style={{ ...inp2, flex: 1 }} />
              {bs.length > 1 && (
                <button onClick={() => remB(i)} style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.22)', borderRadius: 9, width: 38, height: 38, color: 'var(--red)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconX />
                </button>
              )}
            </div>
          ))}
          <button onClick={addB} style={{ width: '100%', background: 'rgba(255,255,255,0.50)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1.5px dashed rgba(0,122,255,0.38)', borderRadius: 12, padding: 10, cursor: 'pointer', color: 'var(--blue)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IconPlus size={16} /> Hinzufügen
          </button>
        </div>
      ) : (
        <div className="inset-grouped-list" style={{ marginBottom: 16 }}>
          {(order.beanstandungen || []).map((b, i) => (
            <div key={i} className="list-row" style={{ cursor: 'default' }}>
              <span style={{ fontWeight: 600, color: 'var(--blue)', marginRight: 8, fontSize: 13 }}>#{i + 1}</span>
              <span className="sf-subhead">{b}</span>
            </div>
          ))}
        </div>
      )}

      {/* Checklist */}
      {showChecklist && (
        <>
          <p className="section-header">Checkliste</p>
          <div className="inset-grouped-list" style={{ marginBottom: 16 }}>
            {items.map((item, i) => (
              <label key={i} className="list-row" style={{ cursor: 'pointer' }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, transition: 'background 0.15s',
                  background: item.checked ? 'var(--blue)' : 'none',
                  border: `1.5px solid ${item.checked ? 'var(--blue)' : 'var(--label3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.checked && <IconCheck size={12} />}
                </div>
                <input type="checkbox" checked={item.checked} onChange={() => togItem(i)} style={{ display: 'none' }} />
                <span style={{ flex: 1, fontSize: 16, color: item.checked ? 'var(--label3)' : 'var(--label)', textDecoration: item.checked ? 'line-through' : 'none' }}>
                  {item.text}
                </span>
                <button onClick={(e) => { e.preventDefault(); remItem(i) }}
                  style={{ background: 'none', border: 'none', color: 'var(--label3)', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                  <IconX />
                </button>
              </label>
            ))}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8 }}>
              <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()}
                placeholder="Neue Position…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 17, color: 'var(--label)' }} />
              <button onClick={addItem} style={{ background: 'linear-gradient(to bottom,rgba(84,164,255,0.95) 0%,rgba(0,122,255,0.95) 50%,rgba(0,86,179,0.95) 100%)', color: '#fff', border: '1px solid #004fb0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconPlus size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Amounts (edit mode) */}
      {edit && (
        <>
          <p className="section-header">Beträge</p>
          <div className="form-section" style={{ marginBottom: 16 }}>
            <div style={{ padding: '11px 16px', borderBottom: '0.33px solid var(--sep)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, color: 'var(--label2)' }}>Offerte CHF</span>
              <input type="number" value={offB} onChange={(e) => setOffB(e.target.value)} placeholder="0.00"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 16, color: 'var(--label)', textAlign: 'right', width: 100 }} />
            </div>
            <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, color: 'var(--label2)' }}>Rechnung CHF</span>
              <input type="number" value={recB} onChange={(e) => setRecB(e.target.value)} placeholder="0.00"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 16, color: 'var(--label)', textAlign: 'right', width: 100 }} />
            </div>
          </div>
        </>
      )}

      {/* Amounts (view mode) */}
      {!edit && (offB || recB) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {offB && (
            <div className="glass-panel" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--label2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Offerte</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--label)' }}>CHF {offB}</div>
            </div>
          )}
          {recB && (
            <div className="glass-panel" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--label2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Rechnung</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--blue)' }}>CHF {recB}</div>
            </div>
          )}
        </div>
      )}

      {/* Zahlungsfrist (edit mode) */}
      {edit && ['bezahlung', 'bezahlt'].includes(status) && (
        <>
          <p className="section-header">Zahlungsfrist</p>
          <div className="form-section" style={{ marginBottom: 16 }}>
            <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, color: 'var(--label2)' }}>Zahlungsziel (Tage, Standard: 30)</span>
              <input type="number" value={zahlungsFrist} onChange={(e) => setZahlungsFrist(e.target.value)} placeholder="30" min={1}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 16, color: 'var(--label)', textAlign: 'right', width: 60 }} />
            </div>
          </div>
        </>
      )}

      {/* Zahlungsfrist countdown (view mode) */}
      {!edit && zahlungsFrist && ['bezahlung', 'bezahlt'].includes(status) && (() => {
        const frist = parseInt(zahlungsFrist), vergangen = daysSince(order.statusChangedAt), verbl = frist - vergangen, abg = verbl < 0
        return (
          <div className={`alert-banner ${abg ? 'alert-danger' : 'alert-warning'}`} style={{ marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Zahlungsfrist</div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{abg ? `${Math.abs(verbl)} Tage überfällig!` : `${verbl} Tage verbleibend`}</div>
            </div>
          </div>
        )
      })()}

      {/* Payment banner */}
      {!edit && (
        <div style={{ background: 'rgba(52,199,89,0.09)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, border: '0.5px solid rgba(52,199,89,0.22)' }}>
          <span style={{ fontSize: 15, color: 'var(--green)' }}>✓</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>Zahlungsfrist: {zahlungsFrist || 30} Tage netto</span>
        </div>
      )}

      {/* Notizen */}
      {edit ? (
        <>
          <p className="section-header">Notizen</p>
          <div className="form-section" style={{ marginBottom: 16 }}>
            <textarea value={notizen} onChange={(e) => setNotizen(e.target.value)} placeholder="Interne Notizen…" rows={3}
              style={{ display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', outline: 'none', fontSize: 17, color: 'var(--label)', resize: 'vertical' }} />
          </div>
        </>
      ) : notizen ? (
        <div style={{ background: 'var(--fill3)', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: 'var(--label2)', marginBottom: 16 }}>
          {notizen}
        </div>
      ) : null}

      <button onClick={() => exportOrderExcel(order, customer)} className="btn-system btn-secondary" style={{ marginBottom: 12 }}>
        ↓ Excel herunterladen
      </button>
      <button onClick={async () => { if (window.confirm('Auftrag wirklich löschen?')) await onDelete(order.id) }}
        className="btn-system btn-destructive" style={{ marginBottom: 12 }}>
        Auftrag löschen
      </button>
      <div style={{ fontSize: 13, color: 'var(--label3)', textAlign: 'center', paddingBottom: 8 }}>
        Erstellt: {formatDate(order.createdAt)} · #{order.orderNumber}
      </div>
    </Sheet>
  )
}
