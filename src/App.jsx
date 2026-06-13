import { useState, useEffect } from 'react'
import { auth, db, parseRows } from './lib/supabase.js'
import { showToast } from './components/ui/Toast.jsx'
import { Spinner } from './components/ui/Spinner.jsx'
import { Sheet } from './components/ui/Sheet.jsx'
import { LoginPage } from './components/LoginPage.jsx'
import { NavBar } from './components/NavBar.jsx'
import { TabBar } from './components/TabBar.jsx'
import { CustomerForm } from './components/customers/CustomerForm.jsx'
import { CustomerDetail } from './components/customers/CustomerDetail.jsx'
import { QuoteForm } from './components/quotes/QuoteForm.jsx'
import { QuoteDetail } from './components/quotes/QuoteDetail.jsx'
import { OrderForm } from './components/orders/OrderForm.jsx'
import { OrderDetail } from './components/orders/OrderDetail.jsx'
import { Dashboard } from './views/Dashboard.jsx'
import { OrdersView } from './views/OrdersView.jsx'
import { QuotesView } from './views/QuotesView.jsx'
import { CustomersView } from './views/CustomersView.jsx'
import { needsAttention } from './lib/utils.js'
import { IconPerson, IconWrench, IconDoc } from './components/icons.jsx'

export default function App() {
  const [token,       setToken]       = useState(() => localStorage.getItem('garage_token') || null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab,         setTab]         = useState('dashboard')
  const [customers,   setCustomers]   = useState([])
  const [orders,      setOrders]      = useState([])
  const [offerten,    setOfferten]    = useState([])
  const [orderNum,    setOrderNum]    = useState(0)
  const [offertNum,   setOffertNum]   = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [syncStatus,  setSyncStatus]  = useState('idle')

  /* UI state */
  const [showNC,    setShowNC]    = useState(false)
  const [showNO,    setShowNO]    = useState(false)
  const [showNOff,  setShowNOff]  = useState(false)
  const [newOCid,   setNewOCid]   = useState(null)
  const [selC,      setSelC]      = useState(null)
  const [editC,     setEditC]     = useState(null)
  const [selO,      setSelO]      = useState(null)
  const [selOff,    setSelOff]    = useState(null)
  const [afterSave, setAfterSave] = useState(null)
  const [fabOpen,   setFabOpen]   = useState(false)

  /* ── Auth check ── */
  useEffect(() => {
    if (!token) { setAuthChecked(true); return }
    auth.getUser(token).then((u) => {
      if (u.error || !u.email) {
        localStorage.removeItem('garage_token')
        localStorage.removeItem('garage_email')
        setToken(null)
      }
      setAuthChecked(true)
    })
  }, [])

  /* ── Data load ── */
  useEffect(() => {
    if (!token || !authChecked) return
    ;(async () => {
      try {
        const [cr, or, cnt, offr] = await Promise.all([
          db.get('customers', token),
          db.get('orders',    token),
          db.getCounter(token),
          db.get('offerten',  token).catch(() => []),
        ])
        setCustomers(parseRows(cr))
        setOrders(parseRows(or))
        setOrderNum(cnt)
        const offs = parseRows(offr)
        setOfferten(offs)
        if (offs.length) setOffertNum(Math.max(...offs.map((o) => o.offertNumber || 0)))
      } catch (e) { console.error(e) }
      setLoading(false)
    })()
  }, [token, authChecked])

  /* ── Sync helper ── */
  async function syncOk(fn) {
    setSyncStatus('saving')
    try {
      await fn()
      setSyncStatus('ok')
      setTimeout(() => setSyncStatus('idle'), 2200)
    } catch (e) {
      setSyncStatus('error')
      showToast('Speichern fehlgeschlagen: ' + (e?.message || 'Unbekannter Fehler'), 'error')
      throw e
    }
  }

  /* ── Auth ── */
  function handleLogin(t) { setToken(t); setLoading(true) }
  async function handleLogout() {
    if (!window.confirm('Abmelden?')) return
    await auth.signOut(token)
    localStorage.removeItem('garage_token')
    localStorage.removeItem('garage_email')
    setToken(null); setCustomers([]); setOrders([])
  }

  /* ── Customer CRUD ── */
  async function addCustomer(data) {
    const id   = `c_${Date.now()}`
    const newC = { id, ...data, createdAt: new Date().toISOString() }
    await syncOk(() => db.upsert('customers', { id, data: newC }, token))
    setCustomers((p) => [...p, newC])
    setShowNC(false)
    setAfterSave(id)
  }
  async function updateCustomer(id, data) {
    const updated = { ...customers.find((c) => c.id === id), ...data }
    await syncOk(() => db.upsert('customers', { id, data: updated }, token))
    setCustomers((p) => p.map((c) => (c.id === id ? updated : c)))
  }

  /* ── Order CRUD ── */
  async function addOrder(data) {
    const num  = orderNum + 1
    const newO = { id: `o_${Date.now()}`, orderNumber: num, status: 'offerte_erstellen', statusChangedAt: new Date().toISOString(), createdAt: new Date().toISOString(), ...data }
    await syncOk(async () => { await db.upsert('orders', { id: newO.id, data: newO }, token); await db.setCounter(num, token) })
    setOrders((p) => [...p, newO])
    setOrderNum(num); setShowNO(false); setNewOCid(null); setAfterSave(null)
  }
  async function updateOrder(upd, cp) {
    await syncOk(() => db.upsert('orders', { id: upd.id, data: upd }, token))
    setOrders((p) => p.map((o) => (o.id === upd.id ? upd : o)))
    setSelO(upd)
    if (cp) await updateCustomer(upd.customerId, cp)
  }
  async function deleteOrder(id) {
    await syncOk(() => db.delete('orders', id, token))
    setOrders((p) => p.filter((o) => o.id !== id))
    setSelO(null)
  }

  /* ── Quote CRUD ── */
  async function addOfferte(data) {
    const num    = offertNum + 1
    const newOff = { id: `off_${Date.now()}`, offertNumber: num, status: 'entwurf', createdAt: new Date().toISOString(), ...data }
    await syncOk(() => db.upsert('offerten', { id: newOff.id, data: newOff }, token))
    setOfferten((p) => [...p, newOff])
    setOffertNum(num); setShowNOff(false)
    setTab('offerten')
    showToast(`Offerte #${num} gespeichert`, 'success')
  }
  async function updateOfferte(upd) {
    await syncOk(() => db.upsert('offerten', { id: upd.id, data: upd }, token))
    setOfferten((p) => p.map((o) => (o.id === upd.id ? upd : o)))
    setSelOff(upd)
  }
  async function deleteOfferte(id) {
    await syncOk(() => db.delete('offerten', id, token))
    setOfferten((p) => p.filter((o) => o.id !== id))
    setSelOff(null)
  }

  /* ── Guards ── */
  if (!authChecked) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )
  if (!token) return <LoginPage onLogin={handleLogin} />
  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Spinner size={36} />
      <span className="sf-subhead" style={{ color: 'var(--label2)' }}>Wird geladen…</span>
    </div>
  )

  const todos = orders.filter(needsAttention)

  return (
    <div style={{ minHeight: '100dvh', background: 'transparent', paddingBottom: 'calc(55px + env(safe-area-inset-bottom))' }}>
      <NavBar syncStatus={syncStatus} overdueCount={todos.length} onLogout={handleLogout} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 8px' }}>
        {tab === 'dashboard' && <Dashboard customers={customers} orders={orders} onOrderClick={setSelO} />}
        {tab === 'auftraege' && <OrdersView orders={orders} customers={customers} onOrderClick={setSelO} />}
        {tab === 'offerten'  && <QuotesView offerten={offerten} customers={customers} onQuoteClick={setSelOff} onNew={() => setShowNOff(true)} />}
        {tab === 'kunden'    && <CustomersView customers={customers} orders={orders} onCustomerClick={setSelC} />}
      </div>

      {/* FAB context menu overlay */}
      {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 498 }} />}
      {fabOpen && (
        <div className="context-menu" style={{ bottom: 'calc(68px + env(safe-area-inset-bottom))', right: 16 }}>
          <button className="context-item" onClick={() => { setShowNC(true); setFabOpen(false) }}>
            <span>Neuer Kunde</span>
            <span className="context-item-icon"><IconPerson /></span>
          </button>
          <button className="context-item" onClick={() => { setNewOCid(null); setShowNO(true); setFabOpen(false) }}>
            <span>Neuer Auftrag</span>
            <span className="context-item-icon"><IconWrench /></span>
          </button>
          <button className="context-item" onClick={() => { setShowNOff(true); setFabOpen(false) }}>
            <span>Neue Offerte</span>
            <span className="context-item-icon"><IconDoc /></span>
          </button>
        </div>
      )}

      <TabBar activeTab={tab} onTabChange={setTab} fabOpen={fabOpen} onFabToggle={() => setFabOpen((p) => !p)} />

      {/* ── Sheets ── */}
      {afterSave && !showNO && (() => {
        const c = customers.find((x) => x.id === afterSave)
        return (
          <Sheet title="Kunde gespeichert" onClose={() => setAfterSave(null)}>
            <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
              <p className="sf-body" style={{ color: 'var(--label2)', marginBottom: 24 }}>
                Möchtest du direkt einen Auftrag für {c?.vorname || ''} {c?.nachname || ''} erstellen?
              </p>
            </div>
            <button onClick={() => { setNewOCid(afterSave); setShowNO(true) }} className="btn-system" style={{ marginBottom: 12 }}>Auftrag erstellen</button>
            <button onClick={() => setAfterSave(null)} className="btn-system btn-secondary">Später</button>
          </Sheet>
        )
      })()}

      {showNO && (
        <Sheet title="Neuer Auftrag" onClose={() => { setShowNO(false); setNewOCid(null) }}
          barRight={<button className="bar-btn" onClick={() => { setShowNO(false); setNewOCid(null) }} style={{ color: 'var(--label2)' }}>Abbrechen</button>}>
          <OrderForm customers={customers} customerId={newOCid} onSave={addOrder} onCancel={() => { setShowNO(false); setNewOCid(null) }} />
        </Sheet>
      )}

      {showNC && (
        <Sheet title="Neuer Kunde" onClose={() => setShowNC(false)}
          barRight={<button className="bar-btn" onClick={() => setShowNC(false)} style={{ color: 'var(--label2)' }}>Abbrechen</button>}>
          <CustomerForm onSave={addCustomer} onCancel={() => setShowNC(false)} />
        </Sheet>
      )}

      {showNOff && (
        <Sheet title="Neue Offerte" onClose={() => setShowNOff(false)} full
          barRight={<button className="bar-btn" onClick={() => setShowNOff(false)} style={{ color: 'var(--label2)' }}>Abbrechen</button>}>
          <QuoteForm customers={customers} onSave={addOfferte} onCancel={() => setShowNOff(false)} />
        </Sheet>
      )}

      {selOff && (
        <QuoteDetail
          offerte={selOff}
          customer={customers.find((c) => c.id === selOff.customerId)}
          onClose={() => setSelOff(null)}
          onUpdate={updateOfferte}
          onDelete={deleteOfferte}
        />
      )}

      {selC && !selO && (
        <CustomerDetail
          customer={selC} orders={orders}
          onClose={() => setSelC(null)}
          onEdit={() => setEditC(selC)}
          onNewOrder={() => { setNewOCid(selC.id); setShowNO(true); setSelC(null) }}
          onOrderClick={(o) => { setSelO(o); setSelC(null) }}
        />
      )}

      {editC && (
        <Sheet title="Kunde bearbeiten" onClose={() => setEditC(null)}
          barRight={<button className="bar-btn" onClick={() => setEditC(null)} style={{ color: 'var(--label2)' }}>Abbrechen</button>}>
          <CustomerForm
            initial={editC}
            onSave={async (data) => { await updateCustomer(editC.id, data); setEditC(null); showToast('Kunde aktualisiert', 'success') }}
            onCancel={() => setEditC(null)}
          />
        </Sheet>
      )}

      {selO && (
        <OrderDetail
          order={selO}
          customer={customers.find((c) => c.id === selO.customerId)}
          onClose={() => setSelO(null)}
          onUpdate={updateOrder}
          onDelete={deleteOrder}
        />
      )}
    </div>
  )
}
