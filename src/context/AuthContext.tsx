import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import axios from 'axios'
import type { PropsWithChildren } from 'react'
import { isLocale, useLocale, useTranslations } from '../i18n'
import { authTokenStorage } from '../lib/api'
import { authService } from '../services/auth.service'
import { currentUserService } from '../services/currentUser.service'
import { AuthContext } from './authContextValue'
import { useGlobalLoader } from './useGlobalLoader'
import type { AuthResponse, AuthUser } from '../services/auth.service'
import type { AuthContextValue, AuthPersistence } from './authContextValue'

const AUTH_USER_STORAGE_KEY = 'nexhire_auth_user'

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

function getStoredUserPersistence(): AuthPersistence {
  return localStorage.getItem(AUTH_USER_STORAGE_KEY) ? 'local' : 'session'
}

function isSameUser(left: AuthUser, right: AuthUser) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function isSessionExpiredError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { common } = useTranslations()
  const { syncLocale } = useLocale()
  const { track: trackGlobalLoader } = useGlobalLoader()
  const hydratedIdentityRef = useRef<string | null>(null)
  const hydrationRequestRef = useRef(0)
  const userPersistenceRef = useRef<AuthPersistence>(getStoredUserPersistence())
  const [profileRefreshKey, setProfileRefreshKey] = useState(0)
  const [isHydratingUser, setHydratingUser] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Chỉ restore user khi vẫn còn access token
    if (!authTokenStorage.getAccessToken()) {
      clearStoredUser()
      return null
    }

    return readStoredUser()
  })

  const clearSession = useCallback(() => {
    hydratedIdentityRef.current = null
    authTokenStorage.clearTokens()
    clearStoredUser()
    setUser(null)
  }, [])

  // Đồng bộ khi tab khác clear token (logout) → user trở về null
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!authTokenStorage.getAccessToken()) {
        clearStoredUser()
        hydratedIdentityRef.current = null
        setHydratingUser(false)
        setUser((current) => (current ? null : current))
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  const login = useCallback(
    (auth: AuthResponse, persistence: AuthPersistence = 'session') => {
      if (isLocale(auth.user.language)) {
        syncLocale(auth.user.language)
      }

      authTokenStorage.setTokens(auth.tokens, persistence)
      writeStoredUser(auth.user, persistence)
      userPersistenceRef.current = persistence
      hydratedIdentityRef.current = null
      setUser(auth.user)
      setProfileRefreshKey((current) => current + 1)
    },
    [syncLocale],
  )

  const logout = useCallback(async () => {
    const refreshToken = authTokenStorage.getRefreshToken()
    clearSession()

    if (!refreshToken) {
      return
    }

    try {
      await trackGlobalLoader(authService.logout(refreshToken), {
        label: common.loader.logoutLabel,
        mode: 'bar',
      })
    } catch {
      // Logout on the client should still complete if the server token is already invalid.
    }
  }, [clearSession, common.loader.logoutLabel, trackGlobalLoader])

  const refreshUser = useCallback(() => {
    hydratedIdentityRef.current = null
    setProfileRefreshKey((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!user || !authTokenStorage.getAccessToken()) {
      setHydratingUser(false)
      return
    }

    const identityKey = `${user.id}:${user.role}:${profileRefreshKey}`

    if (hydratedIdentityRef.current === identityKey) {
      setHydratingUser(false)
      return
    }

    let isActive = true
    const requestId = hydrationRequestRef.current + 1
    hydrationRequestRef.current = requestId
    hydratedIdentityRef.current = identityKey
    setHydratingUser(true)

    currentUserService
      .getCurrentUser(user)
      .then((nextUser) => {
        if (!isActive) {
          return
        }

        if (isLocale(nextUser.language)) {
          syncLocale(nextUser.language)
        }

        setUser((currentUser) => {
          if (!currentUser || currentUser.id !== user.id || currentUser.role !== user.role) {
            return currentUser
          }

          const mergedUser = { ...currentUser, ...nextUser }

          if (isSameUser(currentUser, mergedUser)) {
            return currentUser
          }

          writeStoredUser(mergedUser, userPersistenceRef.current)
          return mergedUser
        })
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        if (isSessionExpiredError(error)) {
          clearSession()
        }
      })
      .finally(() => {
        if (isActive && hydrationRequestRef.current === requestId) {
          setHydratingUser(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [clearSession, profileRefreshKey, syncLocale, user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isHydratingUser,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
    }),
    [user, isHydratingUser, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
