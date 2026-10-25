import { useEffect, useState } from 'react'
import { rpc } from '../api'
import { today, monthStart } from '../util'
import Table from '../components/Table'

export default function Dashboard() {
  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(today())
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = () =>
    rpc('admin_summary', { p_from: from, p_to: to })
      .then((r) => { setRows(r); setErr('') })
      .catch((e) => setErr(e.message))

  useEffect(() => { load() }, [])

  const tot = {}
  const days = {}
  let all = 0
  rows.forEach((x) => {
    const n = Number(x.cnt)
    all += n
    tot[x.result] = (tot[x.result] || 0) + n
    const d = (days[x.day] = days[x.day] || { day: x.day, breakfast: 0, lunch: 0, dinner: 0, other: 0, bad: 0 })
    d[x.meal] = (d[x.meal] || 0) + n
    if (['DUE', 'BLOCKED', 'NOT_FOUND'].includes(x.result)) d.bad += n
  })
  const dayRows = Object.values(days).sort((a, b) => (a.day < b.day ? 1 : -1))

  return (
    <>
      <div className="panel filters">
        <label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button onClick={load}>Show</button>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="stats">
        {[['Total scans', all], ['PAID', tot.PAID], ['GRACE', tot.GRACE], ['DUE', tot.DUE], ['BLOCKED', tot.BLOCKED], ['Invalid', tot.NOT_FOUND]].map(([k, v]) => (
          <div className="stat" key={k}><b>{v || 0}</b>{k}</div>
        ))}
      </div>
      <div className="panel">
        <h2>Din ke hisaab se</h2>
        <Table
          rows={dayRows}
          cols={[['day', 'Date'], ['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['other', 'Other'], ['bad', 'DUE / Blocked / Invalid']]}
        />
      </div>
    </>
  )
}
