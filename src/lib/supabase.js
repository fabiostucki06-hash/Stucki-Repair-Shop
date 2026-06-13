import { SUPA_URL, SUPA_KEY } from './constants.js'

const headers = (token) => ({
  'Content-Type': 'application/json',
  apikey: SUPA_KEY,
  Authorization: `Bearer ${token || SUPA_KEY}`,
})

export const auth = {
  async signIn(email, password) {
    const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ email, password }),
    })
    return r.json()
  },
  async signOut(token) {
    await fetch(`${SUPA_URL}/auth/v1/logout`, { method: 'POST', headers: headers(token) })
  },
  async getUser(token) {
    const r = await fetch(`${SUPA_URL}/auth/v1/user`, { headers: headers(token) })
    return r.json()
  },
}

export const db = {
  async get(table, token) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?select=*`, { headers: headers(token) })
    const j = await r.json()
    if (!r.ok) console.error(`[Supabase] get("${table}") HTTP ${r.status}:`, j)
    return j
  },
  async upsert(table, obj, token) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers(token), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(obj),
    })
    if (!r.ok) {
      const e = await r.json().catch(() => ({}))
      throw new Error(e.message || e.hint || `HTTP ${r.status}`)
    }
  },
  async delete(table, id, token) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE', headers: headers(token),
    })
    if (!r.ok) {
      const e = await r.json().catch(() => ({}))
      throw new Error(e.message || e.hint || `HTTP ${r.status}`)
    }
  },
  async getCounter(token) {
    const r = await fetch(`${SUPA_URL}/rest/v1/counters?id=eq.orderNum&select=value`, { headers: headers(token) })
    const d = await r.json()
    return d?.[0]?.value || 0
  },
  async setCounter(val, token) {
    await fetch(`${SUPA_URL}/rest/v1/counters?id=eq.orderNum`, {
      method: 'PATCH', headers: headers(token), body: JSON.stringify({ value: val }),
    })
  },
}

export function parseRows(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((r) => r && (r.data || (r.id ? r : null)))
    .filter(Boolean)
}
