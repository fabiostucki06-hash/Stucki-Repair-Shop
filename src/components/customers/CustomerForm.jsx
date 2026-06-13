import { useState } from 'react'
import { showToast } from '../ui/Toast.jsx'

const EMPTY = { vorname: '', nachname: '', telefon: '', email: '', marke: '', modell: '', kennzeichen: '', km: '' }

export function CustomerForm({ initial, onSave, onCancel, saving }) {
  const [f, setF] = useState(initial || EMPTY)
  const set = (key) => (val) => setF((p) => ({ ...p, [key]: val }))

  function submit() {
    if (!f.vorname.trim() || !f.nachname.trim() || !f.telefon.trim()) {
      showToast('Bitte Pflichtfelder ausfüllen', 'error'); return
    }
    onSave(f)
  }

  return (
    <div>
      <p className="section-header">Name</p>
      <div className="form-section">
        <input className="text-field" placeholder="Vorname" value={f.vorname} onChange={(e) => set('vorname')(e.target.value)} />
        <input className="text-field text-field-last" placeholder="Nachname" value={f.nachname} onChange={(e) => set('nachname')(e.target.value)} />
      </div>

      <p className="section-header">Kontakt</p>
      <div className="form-section">
        <input className="text-field" type="tel" placeholder="Telefon" value={f.telefon} onChange={(e) => set('telefon')(e.target.value)} />
        <input className="text-field text-field-last" type="email" placeholder="E-Mail (optional)" value={f.email} onChange={(e) => set('email')(e.target.value)} />
      </div>

      <p className="section-header">Fahrzeug</p>
      <div className="form-section">
        <input className="text-field" placeholder="Marke" value={f.marke} onChange={(e) => set('marke')(e.target.value)} />
        <input className="text-field" placeholder="Modell" value={f.modell} onChange={(e) => set('modell')(e.target.value)} />
        <input className="text-field" placeholder="Kennzeichen" value={f.kennzeichen} onChange={(e) => set('kennzeichen')(e.target.value)} />
        <input className="text-field text-field-last" type="number" placeholder="KM-Stand (optional)" value={f.km} onChange={(e) => set('km')(e.target.value)} />
      </div>

      <button onClick={submit} disabled={saving} className="btn-system" style={{ marginBottom: 12 }}>
        {saving ? 'Wird gespeichert…' : 'Sichern'}
      </button>
      <button onClick={onCancel} className="btn-system btn-secondary">Abbrechen</button>
    </div>
  )
}
