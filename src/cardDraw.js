export const W = 1012
export const H = 638
const NAVY = '#1B2F4B', DARK = '#0F1E3A', BLUE = '#0B5CAD', INK = '#111827', GREY = '#6B7280'
const FONT = 'Arial, Helvetica, sans-serif'
const font = (size, bold = true) => `${bold ? 'bold ' : ''}${size}px ${FONT}`

const fmt = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function fitOne(ctx, text, maxW, start, min, bold = true) {
  let s = start
  ctx.font = font(s, bold)
  while (s > min && ctx.measureText(text).width > maxW) { s -= 1; ctx.font = font(s, bold) }
  return s
}

function spaced(ctx, text, x, y, gap) {
  let cx = x
  for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + gap }
}
function spacedWidth(ctx, text, gap) {
  let w = 0
  for (const ch of text) w += ctx.measureText(ch).width + gap
  return w - gap
}

function box(ctx, x, y, w, h, r, fill, stroke, lw = 3) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke() }
}

function dietMark(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 3
  ctx.strokeRect(x, y, size, size)
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size * 0.26, 0, Math.PI * 2); ctx.fill()
}

export function drawCard(ctx, { s, photo, qr, logo, from, to }) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)

  // bottom wave
  ctx.fillStyle = '#8BB0DA'
  ctx.beginPath(); ctx.moveTo(0, 448); ctx.bezierCurveTo(120, 452, 230, 490, 340, 520); ctx.lineTo(0, 540); ctx.closePath(); ctx.fill()
  ctx.fillStyle = NAVY
  ctx.beginPath(); ctx.moveTo(0, 466)
  ctx.bezierCurveTo(200, 470, 300, 546, 520, 548)
  ctx.bezierCurveTo(740, 550, 880, 520, W, 515)
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill()

  ctx.fillStyle = '#fff'; ctx.font = font(40)
  ctx.fillText('SAU MESS', 60, 586)
  ctx.font = font(17, false)
  spaced(ctx, 'SOUTH ASIAN UNIVERSITY, NEW DELHI', 60, 612, 3)
  ctx.fillRect(60, 622, 44, 2)

  // logo + divider
  if (logo) {
    const k = Math.min(190 / logo.width, 130 / logo.height)
    const lw = logo.width * k, lh = logo.height * k
    ctx.drawImage(logo, 26 + (190 - lw) / 2, 22 + (130 - lh) / 2, lw, lh)
  }
  ctx.fillStyle = BLUE; ctx.fillRect(228, 38, 3, 112)

  // title
  const TX = 256
  fitOne(ctx, 'SAU MESS', 520, 88, 50)
  const tsize = parseInt(ctx.font.match(/(\d+)px/)[1], 10)
  ctx.fillStyle = DARK; ctx.fillText('SAU ', TX, 110)
  const sauW = ctx.measureText('SAU ').width
  ctx.fillStyle = BLUE; ctx.fillText('MESS', TX + sauW, 110)
  const titleW = sauW + ctx.measureText('MESS').width
  ctx.fillStyle = '#374151'; ctx.font = font(20, false)
  const sub = 'STUDENT MESS FACILITY'
  spaced(ctx, sub, TX + (titleW - spacedWidth(ctx, sub, 7)) / 2, 108 + Math.max(26, tsize * 0.3), 7)

  // photo
  ctx.save()
  ctx.beginPath(); ctx.roundRect(26, 180, 210, 250, 14); ctx.clip()
  ctx.fillStyle = '#d9dde4'; ctx.fillRect(26, 180, 210, 250)
  if (photo) {
    const k = Math.max(210 / photo.width, 250 / photo.height)
    const sw = 210 / k, sh = 250 / k
    ctx.drawImage(photo, (photo.width - sw) / 2, (photo.height - sh) / 2, sw, sh, 26, 180, 210, 250)
  }
  ctx.restore()

  // details
  const LX = 262, CX = 428, VX = 446, VW = 334
  const label = (t, y) => {
    ctx.fillStyle = GREY; ctx.font = font(22, false); ctx.fillText(t, LX, y)
    ctx.fillText(':', CX, y)
  }
  const value = (t, y, max) => {
    fitOne(ctx, String(t ?? '-'), max, 28, 14)
    ctx.fillStyle = INK; ctx.fillText(String(t ?? '-'), VX, y)
  }
  label('Name', 222); value(s.name, 222, VW)
  label('Enrollment No.', 268); value(s.roll_no, 268, VW)
  label('Mess Card No.', 314); value(s.mess_card_no, 314, VW)

  label('Preference', 369)
  if (s.diet) {
    const veg = s.diet === 'veg'
    const c = veg ? '#0A7A2F' : '#B3261E'
    const text = veg ? 'Vegetarian' : 'Non-Vegetarian'
    ctx.font = font(26)
    const pw = 16 + 24 + 10 + ctx.measureText(text).width + 18
    box(ctx, VX, 340, pw, 42, 21, veg ? '#DDF3DF' : '#FBE0DD')
    dietMark(ctx, VX + 16, 349, 24, c)
    ctx.fillStyle = c; ctx.font = font(26)
    ctx.fillText(text, VX + 16 + 24 + 10, 370)
  } else {
    ctx.fillStyle = INK; ctx.font = font(28); ctx.fillText('-', VX, 369)
  }

  label('Validity', 416)
  const validity = `${fmt(from)}  \u2013  ${fmt(to)}`
  fitOne(ctx, validity, 996 - VX, 28, 16)
  ctx.fillStyle = INK; ctx.fillText(validity, VX, 416)

  // QR
  box(ctx, 790, 178, 206, 222, 14, '#fff', BLUE, 3)
  ctx.drawImage(qr, 800, 186, 186, 186)
  ctx.fillStyle = INK; ctx.font = font(17, false); ctx.textAlign = 'center'
  ctx.fillText('Scan for Verification', 893, 391)
  ctx.textAlign = 'left'

  // rectangle ki kinar line
  ctx.strokeStyle = '#C9D2E0'; ctx.lineWidth = 4
  ctx.strokeRect(2, 2, W - 4, H - 4)
}