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
    return createPersistedUser(JSON.parse(raw) as AuthUser)
  } catch {
    return null
  }
}

function clearStoredUser() {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

function createPersistedUser(user: AuthUser): AuthUser {
  if (user.role !== 'CANDIDATE') {
    return user
  }

  // Candidate profile avatar URLs are short-lived signed URLs. Never persist them.
  // Keep only the durable avatar document id and provider fallback between reloads.
  return {
    ...user,
    avatarUrl: null,
    candidateAvatarUrl: null,
  }
}

function createSessionUser(user: AuthUser): AuthUser {
  if (user.role !== 'CANDIDATE') {
    return user
  }

  // Do not infer provider avatar from avatarUrl here. Only the Google login
  // mapper is allowed to classify the auth response avatar as provider-owned.
  return {
    ...user,
    avatarUrl: null,
    candidateAvatarUrl: user.candidateAvatarUrl ?? null,
    providerAvatarUrl: user.providerAvatarUrl ?? null,
  }
}

function writeStoredUser(user: AuthUser, persistence: AuthPersistence) {
  clearStoredUser()
  const storage = persistence === 'local' ? localStorage : sessionStorage
  storage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(createPersistedUser(user)))
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
  const userRef = useRef<AuthUser | null>(user)
  userRef.current = user
  const userId = user?.id ?? null
  const userRole = user?.role ?? null

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

      const sessionUser = createSessionUser(auth.user)

      authTokenStorage.setTokens(auth.tokens, persistence)
      writeStoredUser(sessionUser, persistence)
      userPersistenceRef.current = persistence
      hydratedIdentityRef.current = null
      setUser(sessionUser)
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

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser
      }

      const nextUser = { ...currentUser, ...patch }

      if (isSameUser(currentUser, nextUser)) {
        return currentUser
      }

      writeStoredUser(nextUser, userPersistenceRef.current)
      return nextUser
    })
  }, [])

  useEffect(() => {
    if (!userId || !userRole || !authTokenStorage.getAccessToken()) {
      setHydratingUser(false)
      return
    }

    const identityKey = `${userId}:${userRole}:${profileRefreshKey}`

    if (hydratedIdentityRef.current === identityKey) {
      setHydratingUser(false)
      return
    }

    const userSnapshot = userRef.current

    if (!userSnapshot || userSnapshot.id !== userId || userSnapshot.role !== userRole) {
      return
    }

    let isActive = true
    const requestId = hydrationRequestRef.current + 1
    hydrationRequestRef.current = requestId
    hydratedIdentityRef.current = identityKey
    setHydratingUser(true)

    currentUserService
      .getCurrentUser(userSnapshot)
      .then((nextUser) => {
        if (!isActive || hydrationRequestRef.current !== requestId) {
          return
        }

        if (isLocale(nextUser.language)) {
          syncLocale(nextUser.language)
        }

        setUser((currentUser) => {
          if (
            !currentUser ||
            currentUser.id !== userId ||
            currentUser.role !== userRole ||
            hydrationRequestRef.current !== requestId
          ) {
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
        if (!isActive || hydrationRequestRef.current !== requestId) {
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
  }, [clearSession, profileRefreshKey, syncLocale, userId, userRole])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isHydratingUser,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, isHydratingUser, login, logout, refreshUser, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
