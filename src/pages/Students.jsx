import { useEffect, useState } from 'react'
import { rpc } from '../api'
import Table from '../components/Table'

const COLS = [
  ['mess_card_no', 'Card'], ['name', 'Name'], ['roll_no', 'Roll'], ['status', 'Status'],
  ['paid_upto', 'Paid upto'], ['due_amount', 'Due'],
]

export default function Students() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = () =>
    rpc('admin_students', { p_q: q.trim() || null })
      .then((r) => { setRows(r); setErr('') })
      .catch((e) => setErr(e.message))

  useEffect(() => { load() }, [])

  return (
    <>
      <div className="panel filters">
        <label>Search<input placeholder="roll / card no / naam" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></label>
        <button onClick={load}>Search</button>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="panel">
        <h2>Students (max 500)</h2>
        <p className="muted">Payments aur status Google Sheet mein badlein. Yahan sirf dekha ja sakta hai.</p>
        <Table cols={COLS} rows={rows} />
      </div>
    </>
  )
}
