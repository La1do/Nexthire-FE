import { apiClient } from '../lib/api'
import type { AuthApiRole } from '../lib/auth/authRole'

type ApiSuccessEnvelope<TData> = {
  success: true
  data: TData
}

export type AuthUser = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: AuthApiRole
  companyId?: string | null
  companyName?: string | null
  emailVerified: boolean
  logoUrl?: string | null
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
  refreshTokenExpiresIn: number
}

export type AuthResponse = {
  user: AuthUser
  tokens: AuthTokens
}

export type LoginPayload = {
  email: string
  password: string
  role: AuthApiRole
}

export type RegisterPayload = {
  fullName: string
  phone: string
  email: string
  password: string
  role: AuthApiRole
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AuthResponse>>('/auth/login', payload)
    return response.data.data
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AuthResponse>>('/auth/register', payload)
    return response.data.data
  },

  async logout(refreshToken: string) {
    const response = await apiClient.post<ApiSuccessEnvelope<{ message: string }>>('/auth/logout', { refreshToken })
    return response.data.data
  },
}
