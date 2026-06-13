export function estimateZE(beschreibung) {
  const t = beschreibung.toLowerCase()
  const rules = [
    [/oelwechsel|ölwechsel/, 2], [/inspektion|service/, 6], [/bremsen|bremsbelag/, 4],
    [/reifen|pneu/, 2], [/getriebe/, 10], [/kupplung/, 8], [/zahnriemen/, 8],
    [/batterie/, 1], [/diagnose/, 1], [/klima/, 3],
  ]
  for (const [re, ze] of rules) if (re.test(t)) return String(ze)
  return '1'
}

export async function estimateZEWithAI(beschreibung, fahrzeug) {
  const fz = [fahrzeug.marke, fahrzeug.modell, fahrzeug.kennzeichen, fahrzeug.km ? fahrzeug.km + 'km' : '']
    .filter(Boolean).join(' ') || 'unbekannt'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Du bist Automechaniker Schweiz. Schätze ZE (1 ZE=0.6min) für:\nFahrzeug: ${fz}\nArbeit: ${beschreibung}\nNur JSON: {"ze":<Zahl>,"begruendung":"<max 60 Zeichen>"}`,
      }],
    }),
  })

  const data   = await res.json()
  const text   = (data.content || []).map((b) => b.text || '').join('')
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
  return { ze: String(Math.round(parsed.ze)), begruendung: parsed.begruendung }
}
