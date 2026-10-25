import { useEffect, useState } from 'react'
import { rpc, rpcAll } from '../api'
import { today, monthStart, fmtT, toCsv, save } from '../util'
import Table from '../components/Table'

const COLS = [
  ['scanned_at', 'Time', fmtT], ['name', 'Name'], ['roll_no', 'Roll'], ['mess_card_no', 'Card'],
  ['meal', 'Meal'], ['result', 'Result'], ['worker', 'Worker'],
]

export default function Scans() {
  const [f, setF] = useState({ from: monthStart(), to: today(), meal: '', result: '', q: '' })
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const args = () => ({
    p_from: f.from, p_to: f.to,
    p_meal: f.meal || null, p_result: f.result || null, p_q: f.q.trim() || null,
  })

  async function load() {
    setMsg('Loading...')
    try { setRows(await rpc('admin_scans', args(), [0, 199])); setMsg('') }
    catch (e) { setMsg(e.message) }
  }
  useEffect(() => { load() }, [])

  async function download() {
    try {
      const r = await rpcAll('admin_scans', args(), (n) => setMsg(`Loading ${n} rows...`))
      r.forEach((x) => { x.scanned_at = new Date(x.scanned_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) })
      save(`scan_log_${f.from}_to_${f.to}.csv`, toCsv(r, ['scanned_at', 'roll_no', 'name', 'mess_card_no', 'meal', 'result', 'worker']))
      setMsg(`${r.length} rows download hue`)
    } catch (e) { setMsg(e.message) }
  }

  return (
    <>
      <div className="panel filters">
        <label>From<input type="date" value={f.from} onChange={set('from')} /></label>
        <label>To<input type="date" value={f.to} onChange={set('to')} /></label>
        <label>Meal
          <select value={f.meal} onChange={set('meal')}>
            <option value="">All</option>
            {['breakfast', 'lunch', 'dinner', 'other'].map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label>Result
          <select value={f.result} onChange={set('result')}>
            <option value="">All</option>
            {['PAID', 'GRACE', 'DUE', 'BLOCKED', 'NOT_FOUND'].map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label>Search<input placeholder="roll / card no / naam" value={f.q} onChange={set('q')} /></label>
        <button onClick={load}>Show</button>
        <button className="alt" onClick={download}>Download CSV</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
      <div className="panel">
        <h2>Scans (latest 200)</h2>
        <Table cols={COLS} rows={rows} />
      </div>
    </>
  )
}
