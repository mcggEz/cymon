import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { api, getStoredSession, setStoredSession } from '../lib/api'

export function AuthProvider({ children }) {
  const initialSession = getStoredSession()
  const [session, setSession] = useState(initialSession)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(initialSession?.access_token))

  useEffect(() => {
    if (!session?.access_token) return
    let active = true
    api
      .me()
      .then((data) => {
        if (!active) return
        setProfile(data.profile)
      })
      .catch(() => {
        if (!active) return
        setStoredSession(null)
        setSession(null)
        setProfile(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [session?.access_token])

  const signIn = useCallback(async (email, password) => {
    const data = await api.login({ email, password })
    setStoredSession(data.session)
    setSession(data.session)
    setProfile(data.profile)
    return data
  }, [])

  const signUp = useCallback(async (payload) => {
    const data = await api.signup(payload)
    if (data.session) {
      setStoredSession(data.session)
      setSession(data.session)
      setProfile(data.profile)
    }
    return data
  }, [])

  const signOut = useCallback(() => {
    setStoredSession(null)
    setSession(null)
    setProfile(null)
  }, [])

  const reloadProfile = useCallback(async () => {
    try {
      const data = await api.me()
      setProfile(data.profile)
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        reloadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
