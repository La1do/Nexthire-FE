export type CompanyReviewStatus = 'pending' | 'approved' | 'rejected'

export type AdminCompanyDocument = {
  id: string
  name: string
  href: string
}

export type AdminCompany = {
  id: string
  name: string
  website: string
  taxCode: string
  address: string
  submittedAt: string
  status: CompanyReviewStatus
  description: string
  logoText: string
  stats: {
    jobPosts: number
    applicants: number
    responseRate: number
  }
  documents: ReadonlyArray<AdminCompanyDocument>
}

export type AdminCompanyCriteria = {
  query: string
  status: CompanyReviewStatus | 'all'
}

export type AdminCompanyStats = {
  pending: number
  approved: number
  rejected: number
}
