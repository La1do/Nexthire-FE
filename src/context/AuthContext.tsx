import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'
import { authTokenStorage } from '../lib/api'
import type { AuthResponse, AuthUser } from '../services/auth.service'

export type AuthPersistence = 'local' | 'session'

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (auth: AuthResponse, persistence?: AuthPersistence) => void
  logout: () => void
}

const AUTH_USER_STORAGE_KEY = 'nexhire_auth_user'

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem(AUTH_USER_STORAGE_KEY) ??
      sessionStorage.getItem(AUTH_USER_STORAGE_KEY)

    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function clearStoredUser() {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

function writeStoredUser(user: AuthUser, persistence: AuthPersistence) {
  clearStoredUser()
  const storage = persistence === 'local' ? localStorage : sessionStorage
  storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Chỉ restore user khi vẫn còn access token
    if (!authTokenStorage.getAccessToken()) {
      clearStoredUser()
      return null
    }

    return readStoredUser()
  })

  // Đồng bộ khi tab khác clear token (logout) → user trở về null
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!authTokenStorage.getAccessToken()) {
        setUser((current) => (current ? null : current))
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const login = useCallback(
    (auth: AuthResponse, persistence: AuthPersistence = 'session') => {
      authTokenStorage.setTokens(auth.tokens, persistence)
      writeStoredUser(auth.user, persistence)
      setUser(auth.user)
    },
    [],
  )

  const logout = useCallback(() => {
    authTokenStorage.clearTokens()
    clearStoredUser()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return ctx
}

export function getAuthUserDisplayName(user: AuthUser): string {
  return user.fullName?.trim() || user.email
}

export function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
