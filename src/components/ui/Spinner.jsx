export function Spinner({ size = 32, color = 'var(--blue)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(255,255,255,0.3)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.75s linear infinite',
      flexShrink: 0,
    }} />
  )
}
