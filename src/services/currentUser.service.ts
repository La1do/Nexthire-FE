import { apiClient } from '../lib/api'
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
}

type CandidateMeResponse = {
  profile: CandidateProfile
}

type CompanyMeResponse = {
  id: string
  name: string
  logo: string | null
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
    phone: profile.phone ?? user.phone,
  })
}

async function getRecruiterUser(user: AuthUser) {
  const response = await apiClient.get<ApiSuccessEnvelope<CompanyMeResponse>>('/companies/me')
  const company = response.data.data

  return mergeDefinedUserFields(user, {
    companyId: company.id,
    companyName: company.name,
    logoUrl: company.logo,
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

    return user
  },
}
