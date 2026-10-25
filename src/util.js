export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
export const monthStart = () => today().slice(0, 8) + '01'

export const fmtT = (t) =>
  new Date(t).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

export function toCsv(rows, cols) {
  const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
  return '\ufeff' + [cols.join(',')].concat(rows.map((r) => cols.map((c) => q(r[c])).join(','))).join('\r\n')
}

export function save(name, text) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
