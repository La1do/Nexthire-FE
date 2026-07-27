// API types for public company endpoints. See BE api-docs/company-service.md.

export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

// GET /api/v1/companies/public/:id — only approved companies are public.
export type PublicCompanyProfile = {
  id: string
  name: string
  logo: string | null
  logoDocumentId: string | null
  description: string | null
  website: string | null
  address: string | null
  mission: string | null
  culture: string | null
  values: string[]
  perks: string[]
  heroImageUrl: string | null
}

export type CompanyResponse = {
  id: string
  name: string
  logo: string | null
  logoUrl?: string | null
  logoDocumentId: string | null
  description: string | null
  industry: string | null
  size: string | null
  foundedYear: number | null
  mission: string | null
  culture: string | null
  values: string[]
  perks: string[]
  heroImageUrl: string | null
  heroImageDocumentId: string | null
  website: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  address: string | null
  taxCode: string
  ownerId: string
  status: CompanyStatus
  canPostJobs: boolean
  completionPercent: number
  missingRequiredFields: string[]
  submittedAt: string | null
  rejectionReason?: string | null
  statusReason?: string | null
  statusChangedAt?: string | null
  statusChangedByUserId?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateCompanyPayload = {
  name: string
  logo?: string | null
  description?: string | null
  industry?: string | null
  size?: string | null
  foundedYear?: number | null
  mission?: string | null
  culture?: string | null
  values?: string[]
  perks?: string[]
  heroImageUrl?: string | null
  website?: string | null
  address?: string | null
  taxCode: string
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>

export type CompanyVerificationDocumentType =
  | 'BUSINESS_LICENSE'
  | 'TAX_CERTIFICATE'
  | 'DOMAIN_PROOF'
  | 'OTHER'

export type CompanyVerificationDocument = {
  id: string
  companyId: string
  documentId: string
  type: CompanyVerificationDocumentType
  documentType?: 'CERTIFICATE' | 'OTHER'
  fileName?: string
  mimeType?: string
  size?: number
  uploadedByUserId: string
  createdAt: string
  updatedAt: string
}

export type UploadedCompanyDocument = {
  id: string
  documentType: 'CERTIFICATE' | 'OTHER'
  ownerType: 'company'
  ownerId: string
  fileName: string
  mimeType: string
  size: number
  key: string
  url: string
}
