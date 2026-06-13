/* Excel export helpers — uses window.XLSX loaded via CDN */
function wb() { return window.XLSX.utils.book_new() }
const addr = (c, r) => window.XLSX.utils.encode_cell({ c, r })
const BLK = '000000', YEL = 'FFFF00'
const bThin = { style: 'thin', color: { rgb: BLK } }
const bAll  = { top: bThin, bottom: bThin, left: bThin, right: bThin }
const fillY = { patternType: 'solid', fgColor: { rgb: YEL } }
const alL   = { horizontal: 'left',   vertical: 'center' }
const alR   = { horizontal: 'right',  vertical: 'center' }
const alC   = { horizontal: 'center', vertical: 'center' }
const fB    = (sz) => ({ bold: true, sz: sz || 10, name: 'Calibri', color: { rgb: BLK } })
const fN    = (sz) => ({ sz: sz || 10, name: 'Calibri', color: { rgb: BLK } })

function set(ws, c, r, v, s) { ws[addr(c, r)] = { v, t: typeof v === 'number' ? 'n' : 's', s: s || {} } }
function num(ws, c, r, v, s) { ws[addr(c, r)] = { v: isNaN(v) ? 0 : v, t: 'n', s: s || {} } }

export function exportOfferteExcel(offerte, customer) {
  const book = wb()
  const ws   = {}
  const datum     = new Date(offerte.createdAt || Date.now()).toLocaleDateString('de-CH')
  const fahrzeug  = customer ? [customer.marke, customer.modell].filter(Boolean).join(' ') : ''
  const positionen = offerte.positionen || []
  const totalB     = parseFloat(offerte.totalBetrag || 0)
  let r = 0

  set(ws, 0, r, 'Budget Offerte',    { font: fB(14), alignment: alL })
  set(ws, 4, r, 'Fabio Stucki',      { font: fN(9),  alignment: alR }); r++
  set(ws, 0, r, 'Offertennummer',    { font: fB(10), fill: fillY, border: bAll, alignment: alL })
  set(ws, 1, r, String(offerte.offertNumber || '–'), { font: fB(10), fill: fillY, border: bAll, alignment: alL })
  set(ws, 2, r, '', { fill: fillY, border: bAll }); set(ws, 3, r, '', { fill: fillY, border: bAll })
  set(ws, 4, r, 'Polenstrasse 245', { font: fN(9), alignment: alR }); r++
  set(ws, 4, r, '5112 Thalheim AG', { font: fN(9), alignment: alR }); r++
  set(ws, 4, r, '079 850 18 63',    { font: fN(9), alignment: alR }); r++; r++

  ;[['Fahrzeug', fahrzeug], ['1. Inv.-Setzung', ''],
    ['Kennzeichen', customer?.kennzeichen || ''], ['Chassis-Nr.', ''],
    ['Km Stand', customer ? String(customer.km || '') : ''],
    ['Fahrzeugbesitzer', customer ? `${customer.vorname} ${customer.nachname}` : ''],
  ].forEach(([l, v]) => {
    set(ws, 0, r, l, { font: fN(10), border: bAll, alignment: alL })
    set(ws, 1, r, v, { font: fN(10), border: bAll, alignment: alL })
    ;[2, 3, 4].forEach((c) => set(ws, c, r, '', { border: bAll })); r++
  })

  set(ws, 0, r, 'Std.Satz:',  { font: fN(10), border: bAll, alignment: alL })
  set(ws, 1, r, 'CHF',        { font: fN(10), border: bAll, alignment: alC })
  set(ws, 2, r, '80.00',      { font: fN(10), border: bAll, alignment: alL })
  ;[3, 4].forEach((c) => set(ws, c, r, '', { border: bAll })); r++

  set(ws, 0, r, 'Bezeichnung', { font: fB(10), border: bAll, alignment: alL })
  set(ws, 1, r, 'Menge',       { font: fB(10), border: bAll, alignment: alC })
  set(ws, 2, r, 'Stk.Preis',   { font: fB(10), border: bAll, alignment: alC })
  set(ws, 3, r, 'Preis (CHF)', { font: fB(10), border: bAll, alignment: alC })
  set(ws, 4, r, 'ZE',          { font: fB(10), border: bAll, alignment: alC }); r++

  const MIN = 10
  positionen.forEach((pos) => {
    const mat = pos.typ === 'material'
    const rS  = { font: fN(9), border: bAll, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } }
    set(ws, 0, r, pos.beschreibung || '', rS)
    mat ? num(ws, 1, r, parseFloat(pos.menge) || 1, { font: fN(9), border: bAll, alignment: alC })
        : set(ws, 1, r, '', { font: fN(9), border: bAll, alignment: alC })
    mat ? num(ws, 2, r, parseFloat(pos.stueckpreis) || 0, { font: fN(9), border: bAll, alignment: alR })
        : set(ws, 2, r, '', { font: fN(9), border: bAll, alignment: alR })
    num(ws, 3, r, parseFloat(pos.preis) || 0, { font: fN(9), border: bAll, alignment: alR })
    set(ws, 4, r, (!mat && pos.ze) ? String(parseFloat(pos.ze)) : '', { font: fN(9), border: bAll, alignment: alC })
    r++
  })
  for (let i = positionen.length; i < MIN; i++) { [0,1,2,3,4].forEach((c) => set(ws, c, r, '', { border: bAll })); r++ }

  set(ws, 0, r, 'Summe',          { font: fN(10), border: bAll, alignment: alL })
  ;[1, 2].forEach((c) => set(ws, c, r, '', { border: bAll }))
  set(ws, 3, r, 'CHF',            { font: fN(10), border: bAll, alignment: alL })
  num(ws, 4, r, totalB,           { font: fN(10), border: bAll, alignment: alR }); r++
  set(ws, 0, r, '',               { border: bAll }); set(ws, 1, r, '', { border: bAll }); set(ws, 2, r, '', { border: bAll })
  set(ws, 3, r, 'CHF',           { font: fN(9), border: bAll, alignment: alL })
  num(ws, 4, r, 0,               { font: fN(9), border: bAll, alignment: alR }); r++
  set(ws, 0, r, 'Offertentotal', { font: fB(10), border: bAll, alignment: alL })
  ;[1, 2].forEach((c) => set(ws, c, r, '', { border: bAll }))
  set(ws, 3, r, 'CHF',           { font: fB(10), border: bAll, alignment: alL })
  num(ws, 4, r, totalB,          { font: fB(10), border: bAll, alignment: alR }); r++; r++
  set(ws, 0, r, 'ZE basieren auf einer reibungslosen Reparatur', { font: fN(9), alignment: alL }); r++
  set(ws, 0, r, 'Kleinmaterial-Pauschale wird bei <100 ZE hinzugefügt', { font: fN(9), alignment: alL }); r++; r++; r++
  set(ws, 0, r, 'Datum', { font: fN(10), alignment: alR })
  set(ws, 1, r, datum,   { font: fN(10), fill: fillY, border: bAll, alignment: alL }); r++
  set(ws, 0, r, 'Ort',   { font: fN(10), alignment: alR })
  set(ws, 1, r, 'Thalheim AG', { font: fN(10), alignment: alL }); r++; r++
  set(ws, 0, r, 'Zahlungskonditionen bei', { font: fN(10), alignment: alL })
  set(ws, 2, r, `${offerte.zahlungsFrist || 30} Tage netto`, { font: fN(10), alignment: alL }); r++
  set(ws, 0, r, 'Rechnungstellung', { font: fN(10), alignment: alL })
  ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }]
  ws['!cols']   = [{ wch: 34 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 10 }]
  ws['!ref']    = window.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r + 1, c: 4 } })
  window.XLSX.utils.book_append_sheet(book, ws, 'Offerte')
  window.XLSX.writeFile(book, `Offerte_${offerte.offertNumber}_${customer?.nachname || 'Kunde'}.xlsx`)
}

export function exportOrderExcel(order, customer) {
  const book     = wb()
  const ws       = {}
  const datum    = new Date(order.createdAt || Date.now()).toLocaleDateString('de-CH')
  const fahrzeug = customer ? [customer.marke, customer.modell].filter(Boolean).join(' ') : ''
  let r = 0

  set(ws, 0, r, 'Kundenauftrag',  { font: fB(14), alignment: alL })
  set(ws, 3, r, 'Fabio Stucki',   { font: fN(9),  alignment: alR }); r++
  set(ws, 0, r, 'Auftragsnummer', { font: fB(10), fill: fillY, border: bAll, alignment: alL })
  set(ws, 1, r, String(order.orderNumber || '–'), { font: fB(10), fill: fillY, border: bAll, alignment: alL })
  set(ws, 2, r, '', { fill: fillY, border: bAll })
  set(ws, 3, r, 'Polenstrasse 245', { font: fN(9), alignment: alR }); r++
  set(ws, 3, r, '5112 Thalheim AG', { font: fN(9), alignment: alR }); r++
  set(ws, 3, r, '079 850 18 63',    { font: fN(9), alignment: alR }); r++; r++

  ;[['Fahrzeug', fahrzeug], ['1. Inv.-Setzung', ''],
    ['Kennzeichen', customer?.kennzeichen || ''], ['Chassis-Nr.', ''],
    ['Km Stand', customer ? String(customer.km || '') : ''],
    ['Fahrzeugbesitzer', customer ? `${customer.vorname} ${customer.nachname}` : ''],
  ].forEach(([l, v]) => {
    set(ws, 0, r, l, { font: fN(10), border: bAll, alignment: alL })
    set(ws, 1, r, v, { font: fN(10), border: bAll, alignment: alL })
    ;[2, 3].forEach((c) => set(ws, c, r, '', { border: bAll })); r++
  })
  ;[0,1,2,3].forEach((c) => set(ws, c, r, '', { border: bAll })); r++
  set(ws, 0, r, 'Std.Satz:', { font: fN(10), border: bAll, alignment: alL })
  set(ws, 1, r, 'CHF',       { font: fN(10), border: bAll, alignment: alC })
  set(ws, 2, r, '80.00',     { font: fN(10), border: bAll, alignment: alL })
  set(ws, 3, r, '',          { border: bAll }); r++
  set(ws, 0, r, 'Arbeiten',  { font: fN(10), border: bAll, alignment: alL })
  ;[1, 2].forEach((c) => set(ws, c, r, '', { border: bAll }))
  set(ws, 3, r, 'ZE', { font: fN(10), border: bAll, alignment: alC }); r++

  const workItems = [
    ...(order.beanstandungen || []).map((b) => b),
    ...(order.offertItems    || []).map((i) => i.text || ''),
  ].filter(Boolean)
  const MIN = 10
  workItems.forEach((text) => {
    set(ws, 0, r, text, { font: fN(9), border: bAll, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } })
    ;[1, 2, 3].forEach((c) => set(ws, c, r, '', { border: bAll })); r++
  })
  for (let i = workItems.length; i < MIN; i++) { [0,1,2,3].forEach((c) => set(ws, c, r, '', { border: bAll })); r++ }
  ;[0,1,2,3].forEach((c) => set(ws, c, r, '', { border: { bottom: bThin } })); r++
  ;[0,1,2,3].forEach((c) => set(ws, c, r, '', { border: { top: bThin } })); r++
  set(ws, 0, r, 'ZE-Total', { font: fB(10), border: bAll, alignment: alL })
  ;[1,2,3].forEach((c) => set(ws, c, r, '', { border: bAll })); r++; r++
  set(ws, 0, r, 'ZE basieren auf einer reibungslosen Reparatur', { font: fN(9), alignment: alL }); r++; r++; r++
  set(ws, 0, r, 'Beginndatum',     { font: fN(10), alignment: alR })
  set(ws, 1, r, datum,             { font: fN(10), fill: fillY, border: bAll, alignment: alL }); r++
  set(ws, 0, r, 'Fertigstelldatum',{ font: fN(10), alignment: alR })
  set(ws, 1, r, '',                { font: fN(10), fill: fillY, border: bAll, alignment: alL }); r++
  set(ws, 0, r, 'Ort',             { font: fN(10), alignment: alR })
  set(ws, 1, r, 'Thalheim AG',     { font: fN(10), alignment: alL }); r++; r++
  set(ws, 0, r, 'Zahlungskonditionen bei', { font: fN(10), alignment: alL })
  set(ws, 2, r, `${order.zahlungsFrist || 30} Tage netto`, { font: fN(10), alignment: alL }); r++
  set(ws, 0, r, 'Rechnungstellung', { font: fN(10), alignment: alL })
  ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }]
  ws['!cols']   = [{ wch: 40 }, { wch: 14 }, { wch: 12 }, { wch: 10 }]
  ws['!ref']    = window.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r + 1, c: 3 } })
  window.XLSX.utils.book_append_sheet(book, ws, 'Auftrag')
  window.XLSX.writeFile(book, `Auftrag_${order.orderNumber}_${customer?.nachname || 'Kunde'}.xlsx`)
}
