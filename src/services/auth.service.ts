import { apiClient } from '../lib/api'
import type { AuthApiRole, PublicAuthApiRole } from '../lib/auth/authRole'
import type { Locale } from '../i18n'

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
  avatarUrl?: string | null
  logoUrl?: string | null
  language?: Locale | null
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

export type AuthProfile = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  role: AuthApiRole
  logoUrl?: string | null
  logoDocumentId?: string | null
  avatarUrl?: string | null
  avatarDocumentId?: string | null
  language?: Locale | null
}

export type UpdateAuthProfilePayload = {
  fullName?: string | null
  language?: Locale
  phone?: string | null
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ForgotPasswordResponse = {
  message: string
  resendCooldownSeconds: number
}

export type LoginPayload = {
  email: string
  password: string
  role: AuthApiRole
}

export type GoogleLoginPayload = {
  idToken: string
  role: PublicAuthApiRole
  nonce?: string
}

export type RegisterPayload = {
  fullName: string
  phone: string
  email: string
  password: string
  role: AuthApiRole
}

export type ResetPasswordPayload = {
  email: string
  newPassword: string
  token: string
}

export type ResetPasswordResponse = {
  message: string
}

export type VerifyEmailPayload = {
  email: string
  token: string
}

export type VerifyEmailResponse = {
  message: string
  emailVerified: boolean
  email: string
  verifiedAt: string
}

export type ResendVerificationEmailPayload = {
  email: string
}

export type ResendVerificationEmailResponse = {
  message: string
  resendCooldownSeconds: number
}

export type ManualEmailVerificationPayload = {
  email: string
}

export type ManualEmailVerificationResponse = {
  message: string
  verificationId: string
  email: string
  token: string
  expiresAt: string
}

export const authService = {
  async getMe() {
    const response = await apiClient.get<ApiSuccessEnvelope<AuthProfile>>('/auth/me')
    return response.data.data
  },

  async updateMe(payload: UpdateAuthProfilePayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AuthProfile>>('/auth/me', payload)
    return response.data.data
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<{ message: string }>>('/auth/change-password', payload)
    return response.data.data
  },

  async updateAdminAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.patch<ApiSuccessEnvelope<AuthProfile>>('/auth/me/avatar', formData)
    return response.data.data
  },

  async deleteAdminAvatar() {
    const response = await apiClient.delete<ApiSuccessEnvelope<AuthProfile>>('/auth/me/avatar')
    return response.data.data
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<ForgotPasswordResponse>>('/auth/forgot-password', payload)
    return response.data.data
  },

  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AuthResponse>>('/auth/login', payload)
    return response.data.data
  },

  async googleLogin(payload: GoogleLoginPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AuthResponse>>('/auth/google/login', payload)
    return response.data.data
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AuthResponse>>('/auth/register', payload)
    return response.data.data
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<ResetPasswordResponse>>('/auth/reset-password', payload)
    return response.data.data
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<VerifyEmailResponse>>('/auth/verify-email', payload)
    return response.data.data
  },

  async resendVerificationEmail(payload: ResendVerificationEmailPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<ResendVerificationEmailResponse>>(
      '/auth/resend-verification',
      payload,
    )
    return response.data.data
  },

  async createManualEmailVerification(payload: ManualEmailVerificationPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<ManualEmailVerificationResponse>>(
      '/auth/manual/email-verification',
      payload,
    )
    return response.data.data
  },

  async logout(refreshToken: string) {
    const response = await apiClient.post<ApiSuccessEnvelope<{ message: string }>>('/auth/logout', { refreshToken })
    return response.data.data
  },
}
