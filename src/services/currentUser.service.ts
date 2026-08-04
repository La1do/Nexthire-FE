import axios from 'axios'
import { apiClient } from '../lib/api'
import type { Locale } from '../i18n'
import { authService } from './auth.service'
import type { AuthUser } from './auth.service'

type ApiSuccessEnvelope<TData> = {
  success: true
  data: TData
}

type CandidateProfile = {
  fullName: string | null
  phone: string | null
  contactEmail: string | null
  avatarDocumentId: string | null
  avatarUrl: string | null
  language?: Locale | null
}

type CandidateMeResponse = {
  profile: CandidateProfile
}

type CompanyMeResponse = {
  id: string
  name: string
  logoUrl: string | null
  logoDocumentId: string | null
  ownerId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
}

function mergeDefinedUserFields(user: AuthUser, fields: Partial<AuthUser>): AuthUser {
  return {
    ...user,
    ...Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    ),
  }
}

async function getCandidateUser(user: AuthUser) {
  const response = await apiClient.get<ApiSuccessEnvelope<CandidateMeResponse>>('/candidates/me')
  const { profile } = response.data.data

  return mergeDefinedUserFields(user, {
    fullName: profile.fullName ?? user.fullName,
    language: profile.language ?? user.language ?? null,
    phone: profile.phone ?? user.phone,
    avatarUrl: profile.avatarUrl ?? user.avatarUrl ?? null,
  })
}

async function getRecruiterUser(user: AuthUser) {
  const account = await authService.getMe()
  let company: CompanyMeResponse | undefined

  try {
    const response = await apiClient.get<ApiSuccessEnvelope<CompanyMeResponse>>('/companies/me')
    company = response.data.data
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      throw error
    }
  }

  return mergeDefinedUserFields(user, {
    email: account.email,
    fullName: account.fullName,
    language: account.language ?? user.language ?? null,
    phone: account.phone,
    companyId: company?.id ?? null,
    companyName: company?.name ?? null,
    logoUrl: company ? company.logoUrl : account.logoUrl ?? null,
  })
}

async function getAdminUser(user: AuthUser) {
  const account = await authService.getMe()
  return mergeDefinedUserFields(user, {
    email: account.email,
    fullName: account.fullName,
    language: account.language ?? user.language ?? null,
    phone: account.phone,
    avatarUrl: account.avatarUrl ?? account.logoUrl ?? null,
  })
}

export const currentUserService = {
  async getCurrentUser(user: AuthUser) {
    if (user.role === 'CANDIDATE') {
      return getCandidateUser(user)
    }

    if (user.role === 'RECRUITER') {
      return getRecruiterUser(user)
    }

    if (user.role === 'ADMIN') {
      return getAdminUser(user)
    }

    return user
  },
}
