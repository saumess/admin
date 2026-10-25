export default function Table({ cols, rows, empty = 'Koi data nahi' }) {
  if (!rows.length) return <p className="muted">{empty}</p>
  return (
    <div className="tw">
      <table>
        <thead>
          <tr>{cols.map(([, label]) => <th key={label}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map(([key, label, fmt]) => (
                <td key={label} className={key === 'result' ? r.result : ''}>
                  {fmt ? fmt(r[key], r) : r[key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
