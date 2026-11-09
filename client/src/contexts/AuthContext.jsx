import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const acceptSession = useCallback((session) => {
    apiClient.setAccessToken(session.accessToken)
    setUser(session.user)
    setSessionError('')
  }, [])

  useEffect(() => {
    let active = true
    apiClient.refresh()
      .then((session) => {
        if (active) {
          acceptSession(session)
        }
      })
      .catch((error) => {
        apiClient.clearAccessToken()
        if (active && error.status !== 401) {
          setSessionError(error.message)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [acceptSession])

  useEffect(() => {
    const handleExpiredSession = () => {
      apiClient.clearAccessToken()
      setUser(null)
      setSessionError('Your session expired. Please sign in again.')
    }

    window.addEventListener('nagara:session-expired', handleExpiredSession)
    return () => {
      window.removeEventListener('nagara:session-expired', handleExpiredSession)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const session = await apiClient.login(credentials)
    acceptSession(session)
    return session.user
  }, [acceptSession])

  const register = useCallback(async (details) => {
    const session = await apiClient.register(details)
    acceptSession(session)
    return session.user
  }, [acceptSession])

  const logout = useCallback(async () => {
    try {
      await apiClient.logout()
    } finally {
      apiClient.clearAccessToken()
      setUser(null)
      setSessionError('')
    }
  }, [])

  const value = useMemo(() => ({
    user,
    isLoading,
    sessionError,
    login,
    register,
    logout,
  }), [user, isLoading, sessionError, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
