import { useState } from 'react'
import { Spinner } from '../ui/Spinner.jsx'
import { IconPlus, IconX } from '../icons.jsx'
import { showToast } from '../ui/Toast.jsx'
import { estimateZE, estimateZEWithAI } from '../../lib/ai.js'

const newArbeit  = () => ({ beschreibung: '', ze: '', stundenansatz: '80', preis: '', zeKI: false, zeLoading: false, zeHint: '' })
const newMaterial = () => ({ beschreibung: '', menge: '1', stueckpreis: '', preis: '' })

export function QuoteForm({ customers, onSave, onCancel }) {
  const [cid,              setCid]              = useState('')
  const [titel,            setTitel]            = useState('')
  const [tab,              setTab]              = useState('arbeit')
  const [arbeit,           setArbeit]           = useState([newArbeit()])
  const [material,         setMaterial]         = useState([newMaterial()])
  const [notizen,          setNotizen]          = useState('')
  const [gueltigBis,       setGueltigBis]       = useState('')
  const [zahlungsFrist,    setZahlungsFrist]    = useState('30')

  const selectedCustomer = customers.find((c) => c.id === cid) || null

  /* ── Arbeit helpers ── */
  const addA = () => setArbeit((a) => [...a, newArbeit()])
  const remA = (i) => setArbeit((a) => a.filter((_, j) => j !== i))
  const updA = (i, key, val) => setArbeit((a) => {
    const n = [...a]; n[i] = { ...n[i], [key]: val }
    if (key === 'beschreibung' && val.trim().length > 3) { n[i].ze = estimateZE(val); n[i].zeKI = false; n[i].zeHint = '' }
    if (key === 'ze') { n[i].zeKI = false; n[i].zeHint = '' }
    const ze = parseFloat(key === 'ze' ? val : n[i].ze) || 0
    const sa = parseFloat(key === 'stundenansatz' ? val : n[i].stundenansatz) || 0
    n[i].preis = ze && sa ? ((ze / 100) * sa).toFixed(2) : ''
    return n
  })
  const kiZE = async (i) => {
    const pos = arbeit[i]; if (!pos.beschreibung.trim()) return
    setArbeit((a) => { const n = [...a]; n[i] = { ...n[i], zeLoading: true }; return n })
    try {
      const fz = selectedCustomer ? { marke: selectedCustomer.marke || '', modell: selectedCustomer.modell || '', kennzeichen: selectedCustomer.kennzeichen || '', km: selectedCustomer.km || '' } : {}
      const r  = await estimateZEWithAI(pos.beschreibung, fz)
      setArbeit((a) => {
        const n = [...a]; const sa = parseFloat(n[i].stundenansatz) || 0; const ze = parseFloat(r.ze) || 0
        n[i] = { ...n[i], ze: r.ze, zeKI: true, zeHint: r.begruendung, zeLoading: false, preis: ze && sa ? ((ze / 100) * sa).toFixed(2) : '' }
        return n
      })
    } catch { setArbeit((a) => { const n = [...a]; n[i] = { ...n[i], zeLoading: false, zeHint: 'KI-Fehler' }; return n }) }
  }

  /* ── Material helpers ── */
  const addM = () => setMaterial((m) => [...m, newMaterial()])
  const remM = (i) => setMaterial((m) => m.filter((_, j) => j !== i))
  const updM = (i, key, val) => setMaterial((m) => {
    const n = [...m]; n[i] = { ...n[i], [key]: val }
    if (key === 'stueckpreis' || key === 'menge') {
      const sp = parseFloat(key === 'stueckpreis' ? val : n[i].stueckpreis) || 0
      const mg = parseFloat(key === 'menge' ? val : n[i].menge) || 1
      n[i].preis = (sp * mg).toFixed(2)
    }
    return n
  })

  const totA  = arbeit.reduce((s, p) => s + (parseFloat(p.preis) || 0), 0)
  const totM  = material.reduce((s, p) => s + (parseFloat(p.preis) || 0), 0)
  const totZE = arbeit.reduce((s, p) => s + (parseFloat(p.ze) || 0), 0)

  function submit() {
    if (!cid) { showToast('Bitte einen Kunden auswählen', 'error'); return }
    const ap = arbeit.filter((p) => p.beschreibung.trim())
    const mp = material.filter((p) => p.beschreibung.trim())
    if (!ap.length && !mp.length) { showToast('Mindestens eine Position eingeben', 'error'); return }
    onSave({
      customerId: cid, titel,
      positionen: [...ap.map((p) => ({ ...p, typ: 'arbeit' })), ...mp.map((p) => ({ ...p, typ: 'material' }))],
      notizen, gueltigBis, zahlungsFrist,
      totalBetrag: (totA + totM).toFixed(2),
      totalArbeit: totA.toFixed(2),
      totalMaterial: totM.toFixed(2),
      totalZE,
    })
  }

  const inp = { display: 'block', width: '100%', padding: '8px 0', background: 'none', border: 'none', outline: 'none', fontSize: 17, color: 'var(--label)' }
  const numInp = { width: '100%', background: 'var(--fill3)', border: 'none', borderRadius: 9, padding: '8px', fontSize: 15, color: 'var(--label)', outline: 'none' }

  return (
    <div>
      {/* Customer + meta */}
      <p className="section-header">Kunde</p>
      <div className="form-section" style={{ marginBottom: 20 }}>
        <div style={{ padding: '11px 16px', borderBottom: '0.33px solid var(--sep)' }}>
          <select value={cid} onChange={(e) => setCid(e.target.value)} style={{ ...inp, color: cid ? 'var(--label)' : 'var(--label3)' }}>
            <option value="">Kunde auswählen…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.vorname} {c.nachname} – {c.kennzeichen}</option>
            ))}
          </select>
        </div>
        <div style={{ padding: '11px 16px', borderBottom: '0.33px solid var(--sep)' }}>
          <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Titel / Betreff" style={inp} />
        </div>
        <div style={{ padding: '11px 16px', borderBottom: '0.33px solid var(--sep)' }}>
          <input type="date" value={gueltigBis} onChange={(e) => setGueltigBis(e.target.value)} style={inp} />
        </div>
        <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, color: 'var(--label2)' }}>Zahlungsfrist (Tage)</span>
          <input type="number" value={zahlungsFrist} onChange={(e) => setZahlungsFrist(e.target.value)}
            min={1} style={{ background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--label)', textAlign: 'right', width: 60 }} />
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['Arbeit', `CHF ${totA.toFixed(2)}`, totZE ? `${totZE} ZE` : null, 'var(--blue)'],
          ['Material', `CHF ${totM.toFixed(2)}`, null, 'var(--green)'],
          ['Total', `CHF ${(totA + totM).toFixed(2)}`, null, 'var(--indigo)']].map(([l, v, sub, c]) => (
          <div key={l} className="glass-panel" style={{ flex: 1, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
            {sub && <div style={{ fontSize: 11, color: 'var(--label3)' }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Doc tabs */}
      <div className="doc-tab-bar">
        {[['arbeit', '🔧', 'Arbeit', arbeit.filter((a) => a.beschreibung).length],
          ['material', '📦', 'Material', material.filter((m) => m.beschreibung).length]].map(([id, icon, label, count]) => (
          <button key={id} className={`doc-tab${tab === id ? ' dt-active' : ''}`} onClick={() => setTab(id)}>
            {icon} {label}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 18, height: 18, borderRadius: 9, fontSize: 11, fontWeight: 700, padding: '0 5px',
              background: count ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)',
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Arbeit positions */}
      {tab === 'arbeit' && (
        <div style={{ marginBottom: 20 }}>
          {arbeit.map((pos, i) => (
            <div key={i} className="card" style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input value={pos.beschreibung} onChange={(e) => updA(i, 'beschreibung', e.target.value)}
                  placeholder="Beschreibung der Arbeit…"
                  style={{ flex: 1, background: 'var(--fill3)', border: 'none', borderRadius: 9, padding: '9px 12px', fontSize: 16, color: 'var(--label)', outline: 'none' }} />
                {arbeit.length > 1 && (
                  <button onClick={() => remA(i)} style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.22)', borderRadius: 9, width: 38, height: 38, color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconX />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{pos.zeKI ? 'KI-ZE' : 'ZE'}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input type="number" value={pos.ze} onChange={(e) => updA(i, 'ze', e.target.value)}
                      placeholder="Auto" min={0}
                      style={{ ...numInp, flex: 1, background: pos.zeKI ? 'rgba(50,173,230,0.10)' : 'var(--fill3)', color: pos.zeKI ? 'var(--teal)' : 'var(--label)', fontWeight: pos.zeKI ? 700 : 400 }} />
                    <button onClick={() => kiZE(i)} disabled={pos.zeLoading || !pos.beschreibung.trim()} title="KI-Schätzung"
                      style={{ width: 36, height: 36, background: pos.zeKI ? 'rgba(50,173,230,0.15)' : 'var(--fill2)', border: 'none', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (pos.zeLoading || !pos.beschreibung.trim()) ? 0.4 : 1, flexShrink: 0 }}>
                      {pos.zeLoading ? <Spinner size={16} /> : '✦'}
                    </button>
                  </div>
                  {pos.zeHint && <div style={{ fontSize: 11, color: pos.zeKI ? 'var(--teal)' : 'var(--red)', marginTop: 3 }}>{pos.zeHint}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>CHF/h</div>
                  <input type="number" value={pos.stundenansatz} onChange={(e) => updA(i, 'stundenansatz', e.target.value)} placeholder="80" style={numInp} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
                  <div style={{ background: 'rgba(0,122,255,0.08)', borderRadius: 9, padding: 8, fontSize: 15, fontWeight: 700, color: 'var(--blue)', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pos.preis ? parseFloat(pos.preis).toFixed(2) : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addA} style={{ width: '100%', background: 'rgba(255,255,255,0.50)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1.5px dashed rgba(0,122,255,0.38)', borderRadius: 12, padding: 11, cursor: 'pointer', color: 'var(--blue)', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IconPlus size={16} /> Arbeitsposition
          </button>
        </div>
      )}

      {/* Material positions */}
      {tab === 'material' && (
        <div style={{ marginBottom: 20 }}>
          {material.map((pos, i) => (
            <div key={i} className="card" style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input value={pos.beschreibung} onChange={(e) => updM(i, 'beschreibung', e.target.value)}
                  placeholder="Material / Ersatzteil…"
                  style={{ flex: 1, background: 'var(--fill3)', border: 'none', borderRadius: 9, padding: '9px 12px', fontSize: 16, color: 'var(--label)', outline: 'none' }} />
                {material.length > 1 && (
                  <button onClick={() => remM(i)} style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.22)', borderRadius: 9, width: 38, height: 38, color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconX />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Menge</div>
                  <input type="number" value={pos.menge} onChange={(e) => updM(i, 'menge', e.target.value)} min={1} style={numInp} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stk. CHF</div>
                  <input type="number" value={pos.stueckpreis} onChange={(e) => updM(i, 'stueckpreis', e.target.value)} placeholder="0.00" style={numInp} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--label2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
                  <div style={{ background: 'rgba(52,199,89,0.10)', borderRadius: 9, padding: 8, fontSize: 15, fontWeight: 700, color: 'var(--green)', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pos.preis ? parseFloat(pos.preis).toFixed(2) : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addM} style={{ width: '100%', background: 'rgba(255,255,255,0.50)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1.5px dashed rgba(52,199,89,0.40)', borderRadius: 12, padding: 11, cursor: 'pointer', color: 'var(--green)', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <IconPlus size={16} /> Materialposition
          </button>
        </div>
      )}

      <p className="section-header">Notizen</p>
      <div className="form-section" style={{ marginBottom: 20 }}>
        <textarea value={notizen} onChange={(e) => setNotizen(e.target.value)} placeholder="Interne Notizen…" rows={3}
          style={{ display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', outline: 'none', fontSize: 17, color: 'var(--label)', resize: 'vertical' }} />
      </div>

      <button onClick={submit} className="btn-system" style={{ marginBottom: 12 }}>Offerte erstellen</button>
      <button onClick={onCancel} className="btn-system btn-secondary">Abbrechen</button>
    </div>
  )
}
