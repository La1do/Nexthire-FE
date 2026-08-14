import { createContext } from 'react'
import type { AuthResponse, AuthUser } from '../services/auth.service'

export type AuthPersistence = 'local' | 'session'

export type AuthContextValue = {
  user: AuthUser | null
  isHydratingUser: boolean
  isAuthenticated: boolean
  login: (auth: AuthResponse, persistence?: AuthPersistence) => void
  logout: () => Promise<void>
  refreshUser: () => void
  updateUser: (patch: Partial<AuthUser>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
