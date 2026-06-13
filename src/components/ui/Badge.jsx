import { SC, QUOTE_STATUSES } from '../../lib/constants.js'

export function Badge({ status, small }) {
  const info = SC[status] || QUOTE_STATUSES[status]
  const label = small ? (SC[status]?.short || info?.label || status) : (info?.label || status)
  return (
    <span
      className={`badge status-${status}`}
      style={{ fontSize: small ? 11 : 13, padding: small ? '2px 8px' : '3px 10px' }}
    >
      {label}
    </span>
  )
}
