import { useEffect, useState } from 'react'
import { AuthContext } from './authContextValue.js'
import { supabase, supabaseConfigured } from '../supabaseClient.js'
import { demoMode } from '../config/appMode.js'

// O modo sem autenticação é usado somente pelo Docker local para facilitar a avaliação.
const demoSession = { user: { email: 'Demonstração local', user_metadata: { nome: 'Demonstração local' } } }

export function AuthProvider({ children }) {
  const [session, setSession] = useState(demoMode ? demoSession : null)
  const [loading, setLoading] = useState(!demoMode && supabaseConfigured)

  useEffect(() => {
    if (demoMode || !supabase) return undefined
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
    if (demoMode) return
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, loading, signOut }}>{children}</AuthContext.Provider>
}
