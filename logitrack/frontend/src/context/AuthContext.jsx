import { useEffect, useState } from 'react'
import { AuthContext } from './authContextValue.js'
import { supabase, supabaseConfigured } from '../supabaseClient.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabase) return undefined
    let mounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: { session: savedSession } }) => {
      if (mounted) { setSession(savedSession); setLoading(false) }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, loading, signOut }}>{children}</AuthContext.Provider>
}
