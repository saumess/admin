import { useState } from 'react'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import { sb } from '../supabase'
import { rpc } from '../api'
import { today } from '../util'
import { drawCard, W, H } from '../cardDraw'
import Table from '../components/Table'

const MAX = 120


function monthRange() {
  const t = today()
  const [y, m] = t.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return [t.slice(0, 8) + '01', t.slice(0, 8) + String(last).padStart(2, '0')]
}

const loadImg = (src) =>
  new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src })

export default function Cards() {
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [sel, setSel] = useState(new Set())
  const [range, setRange] = useState(monthRange())
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function search() {
    try { setRows(await rpc('admin_students', { p_q: q.trim() || null })); setMsg('') }
    catch (e) { setMsg(e.message) }
  }

  const toggle = (id) => {
    const n = new Set(sel)
    if (n.has(id)) n.delete(id)
    else if (n.size >= MAX) { setMsg(`Ek baar mein max ${MAX} cards`); return }
    else n.add(id)
    setSel(n)
  }

  async function prepare(s, logo) {
    let photo = null
    try {
      if (s.photo_file) {
        const { data } = await sb.storage.from('photos').download(s.photo_file)
        if (data) photo = await createImageBitmap(data)
      }
    } catch (e) { /* photo na mile to blank frame */ }
    const url = await QRCode.toDataURL(s.token, { errorCorrectionLevel: 'M', margin: 2, width: 576 })
    return { s, photo, qr: await loadImg(url), logo, from: range[0], to: range[1] }
  }

  async function generate() {
  
    if (!sel.size) return setMsg('Pehle students select karo')
    if (range[0] > range[1]) return setMsg('Valid from, valid to se pehle hona chahiye')
    setBusy(true)
    try {
      const students = await rpc('admin_cards', { p_rolls: [...sel] })
      const logo = await loadImg('/logo.png')
      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const CW = 85.6, CH = 54, GX = 4, GY = 3
      const X0 = (210 - (2 * CW + GX)) / 2, Y0 = (297 - (5 * CH + 4 * GY)) / 2

      for (let i = 0; i < students.length; i++) {
        setMsg(`Card ${i + 1} / ${students.length} ban raha hai...`)
        if (i > 0 && i % 10 === 0) pdf.addPage()
        const p = await prepare(students[i], logo)
        drawCard(ctx, p)
        if (p.photo) p.photo.close()
        const k = i % 10
        const x = X0 + (k % 2) * (CW + GX)
        const y = Y0 + Math.floor(k / 2) * (CH + GY)
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', x, y, CW, CH)
        pdf.setDrawColor(170); pdf.setLineWidth(0.1); pdf.rect(x, y, CW, CH)
      }
      pdf.save(`sau-mess-cards-${range[0]}.pdf`)
      setMsg(`${students.length} cards ka PDF download hua. Print ke baad PDF delete kar do.`)
    } catch (e) { setMsg(e.message) }
    setBusy(false)
  }

  const cols = [
    ['roll_no', 'Select', (v) => <input type="checkbox" checked={sel.has(v)} onChange={() => toggle(v)} />],
    ['mess_card_no', 'Card'], ['name', 'Name'], ['roll_no', 'Roll'], ['status', 'Status'], ['paid_upto', 'Paid upto'],
  ]

  return (
    <>
      <div className="panel filters">
        <label>Search<input placeholder="roll / card no / naam" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} /></label>
        <button onClick={search}>Search</button>
        <button onClick={() => setSel(new Set(rows.slice(0, MAX).map((r) => r.roll_no)))}>Select all (max {MAX})</button>
        <button onClick={() => setSel(new Set())}>Clear</button>
      </div>
      <div className="panel filters">
        <label>Valid from<input type="date" value={range[0]} onChange={(e) => setRange([e.target.value, range[1]])} /></label>
        <label>Valid to<input type="date" value={range[1]} onChange={(e) => setRange([range[0], e.target.value])} /></label>
        <button className="alt" onClick={generate} disabled={busy}>Generate PDF ({sel.size})</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
      <div className="panel">
        <h2>Students</h2>
        <p className="muted">Pehle search karo, phir select karo. Photo, veg/non-veg aur token database se aate hain.</p>
        <Table cols={cols} rows={rows} empty="Search dabao" />
      </div>
    </>
  )
}