import { SO } from './constants.js'

export const daysSince  = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0
export const hoursSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 3600000)  : 0

export function isOverdue(order) {
  if (order.status === 'offerte_verschickt' && hoursSince(order.statusChangedAt) > 48) return true
  if (order.status === 'bezahlung') {
    const f = order.zahlungsFrist ? parseInt(order.zahlungsFrist) : 30
    if (daysSince(order.statusChangedAt) > f) return true
  }
  return false
}

export const needsAttention = (o) => o.status !== 'bezahlt' && isOverdue(o)

export function getActiveStatus(orders, customerId) {
  const active = orders.filter((o) => o.customerId === customerId && o.status !== 'bezahlt')
  if (!active.length) return null
  return active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].status
}

export function initials(vorname = '', nachname = '') {
  return (vorname[0] || '').toUpperCase() + (nachname[0] || '').toUpperCase()
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-CH')
}

export function formatCHF(val) {
  return `CHF ${parseFloat(val || 0).toFixed(2)}`
}

export function sortByName(items, customers) {
  return [...items].sort((a, b) => {
    const ca = customers.find((x) => x.id === a.customerId)
    const cb = customers.find((x) => x.id === b.customerId)
    const na = ca ? `${ca.nachname} ${ca.vorname}`.toLowerCase() : 'zzz'
    const nb = cb ? `${cb.nachname} ${cb.vorname}`.toLowerCase() : 'zzz'
    return na < nb ? -1 : na > nb ? 1 : new Date(b.createdAt) - new Date(a.createdAt)
  })
}
