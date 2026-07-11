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
  accessToken: string
}

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_ENDPOINT = '/auth/refresh-token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

export const authTokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  clearAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
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

    if (error.response?.status === 401 && !originalRequest._retry && accessToken) {
      originalRequest._retry = true

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
        const response = await refreshClient.post<RefreshTokenResponse>(REFRESH_TOKEN_ENDPOINT)
        const newAccessToken = response.data.accessToken

        if (!newAccessToken) {
          throw new Error('Missing refreshed access token')
        }

        authTokenStorage.setAccessToken(newAccessToken)
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        authTokenStorage.clearAccessToken()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
