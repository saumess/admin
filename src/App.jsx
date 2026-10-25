import { useEffect, useState } from 'react'
import { sb } from './supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Scans from './pages/Scans'
import Students from './pages/Students'
import Reports from './pages/Reports'
import Cards from './pages/Cards'

const TABS = { Dashboard, Scans, Students, Cards, Reports }

export default function App() {
  const [session, setSession] = useState(undefined)
  const [tab, setTab] = useState('Dashboard')

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Login />

  const Page = TABS[tab]
  return (
    <>
      <header>
        <b>SAU Mess Admin</b>
        <nav>
          {Object.keys(TABS).map((t) => (
            <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
        <span>
          {(session.user.email || '').split('@')[0]}{' '}
          <button className="ghost" onClick={() => sb.auth.signOut()}>Logout</button>
        </span>
      </header>
      <main><Page key={tab} /></main>
    </>
  )
}
