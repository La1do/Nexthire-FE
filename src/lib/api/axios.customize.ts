import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type QueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

type RefreshTokenResponse = {
  success: true
  data: {
    tokens: {
      accessToken: string
      refreshToken: string
      accessTokenExpiresIn: number
      refreshTokenExpiresIn: number
    }
  }
}

type TokenPersistence = 'local' | 'session'

type AuthTokens = RefreshTokenResponse['data']['tokens']

const ACCESS_TOKEN_KEY = 'nexhire_access_token'
const REFRESH_TOKEN_KEY = 'nexhire_refresh_token'
const TOKEN_PERSISTENCE_KEY = 'nexhire_token_persistence'
const REFRESH_TOKEN_ENDPOINT = '/auth/refresh'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

function getStorage(persistence: TokenPersistence) {
  return persistence === 'local' ? window.localStorage : window.sessionStorage
}

function getCurrentPersistence(): TokenPersistence {
  if (localStorage.getItem(TOKEN_PERSISTENCE_KEY) === 'local') {
    return 'local'
  }

  if (sessionStorage.getItem(TOKEN_PERSISTENCE_KEY) === 'session') {
    return 'session'
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY) ? 'local' : 'session'
}

function readToken(key: string) {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key)
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_PERSISTENCE_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_PERSISTENCE_KEY)
}

function isPublicAuthRequest(url?: string) {
  return Boolean(
    url?.startsWith('/auth/login') ||
      url?.startsWith('/auth/google/login') ||
      url?.startsWith('/auth/register') ||
      url?.startsWith('/auth/forgot-password') ||
      url?.startsWith('/auth/reset-password') ||
      url?.startsWith('/auth/verify-email') ||
      url?.startsWith('/auth/resend-verification') ||
      url?.startsWith('/auth/manual/email-verification') ||
      url?.startsWith(REFRESH_TOKEN_ENDPOINT),
  )
}

export const authTokenStorage = {
  getAccessToken: () => readToken(ACCESS_TOKEN_KEY),
  getRefreshToken: () => readToken(REFRESH_TOKEN_KEY),
  setTokens: (tokens: AuthTokens, persistence: TokenPersistence = getCurrentPersistence()) => {
    clearStoredTokens()

    const storage = getStorage(persistence)
    storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    storage.setItem(TOKEN_PERSISTENCE_KEY, persistence)
  },
  clearTokens: clearStoredTokens,
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((item) => {
    if (error || !token) {
      item.reject(error ?? new Error('Missing refreshed access token'))
      return
    }

    item.resolve(token)
  })

  failedQueue = []
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authTokenStorage.getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const accessToken = authTokenStorage.getAccessToken()

    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      accessToken &&
      !isPublicAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true
      const refreshToken = authTokenStorage.getRefreshToken()

      if (!refreshToken) {
        authTokenStorage.clearTokens()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        const response = await refreshClient.post<RefreshTokenResponse>(
          REFRESH_TOKEN_ENDPOINT,
          { refreshToken },
        )
        const newAccessToken = response.data.data.tokens.accessToken

        if (!newAccessToken) {
          throw new Error('Missing refreshed access token')
        }

        authTokenStorage.setTokens(response.data.data.tokens)
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        authTokenStorage.clearTokens()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
