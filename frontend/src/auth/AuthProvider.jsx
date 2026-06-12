import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContext'

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, email, clinic_id')
    .eq('id', userId)
    .single()
  if (error) {
    console.error('Failed to load profile', error)
    return null
  }
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        setProfile(await fetchProfile(data.session.user.id))
      }
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      if (!active) return
      setSession(next)
      setProfile(next?.user ? await fetchProfile(next.user.id) : null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

