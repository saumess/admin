import { useState } from 'react'
import { rpcAll } from '../api'
import { today, monthStart, toCsv, save } from '../util'
import Table from '../components/Table'

const COLS = [
  ['mess_card_no', 'Card'], ['name', 'Name'], ['roll_no', 'Roll'], ['total', 'Total meals'],
  ['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['grace', 'Grace days'],
]

export default function Reports() {
  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(today())
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      setRows(await rpcAll('admin_student_summary', { p_from: from, p_to: to }, (n) => setMsg(`Loading ${n} students...`)))
      setMsg('')
    } catch (e) { setMsg(e.message) }
  }

  const download = () =>
    save(`student_summary_${from}_to_${to}.csv`, toCsv(rows, COLS.map((c) => c[0])))

  return (
    <>
      <div className="panel filters">
        <label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button onClick={load}>Generate report</button>
        <button className="alt" onClick={download} disabled={!rows.length}>Download CSV</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
      <div className="panel">
        <h2>Student-wise summary</h2>
        <p className="muted">Ek din ke ek meal mein kai baar scan hone par bhi ek hi meal gina jata hai.</p>
        <Table cols={COLS} rows={rows} empty="Date chuno aur Generate report dabao" />
      </div>
    </>
  )
}
