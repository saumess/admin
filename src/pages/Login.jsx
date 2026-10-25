import { useState } from 'react'
import { sb } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setErr('Email ya password galat hai')
  }

  return (
    <form className="login panel" onSubmit={submit}>
      <h1>SAU Mess Admin</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      {err && <p className="error">{err}</p>}
    </form>
  )
}
