import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthContext } from '../context/authContextValue'
import { authTokenStorage } from '../lib/api'
import type { AuthContextValue } from '../context/authContextValue'

export function useAuthGuard() {
  const auth = useContext<AuthContextValue | null>(AuthContext)
  const location = useLocation()
  const user = auth?.user ?? null

  const isAuthenticated =
    auth?.isAuthenticated ?? (typeof window !== 'undefined' ? Boolean(authTokenStorage.getAccessToken()) : false)
  const isCandidate = user?.role === 'CANDIDATE'
  const canSaveJobs = isAuthenticated && isCandidate

  const loginHref = (() => {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return `/login?redirect=${redirect}`
  })()

  return { canSaveJobs, isAuthenticated, isCandidate, loginHref }
}
