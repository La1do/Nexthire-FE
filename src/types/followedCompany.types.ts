import type { ApiMeta } from './job.types'

export type FollowedCompany = {
  id: string
  companyId: string
  companyName: string
  companyLogoUrl?: string | null
  companyLogoDocumentId?: string | null
  followedAt: string
}

export type FollowedCompaniesQuery = {
  page?: number
  limit?: number
}

export type FollowedCompaniesList = {
  data: FollowedCompany[]
  meta: ApiMeta
}

export type FollowCompanyDeleteResult = {
  deleted: true
}

export type CompanyFollowStatus = {
  followed: boolean
}

export type CompanyBatchFollowStatus = {
  followedCompanyIds: string[]
}
