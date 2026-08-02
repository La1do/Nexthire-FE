import type { CompanyVerificationDocumentType } from '../../types/company.types'

export type CompanyVerificationStatus =
  | 'NO_COMPANY'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'

export type CompanyLegalFormValues = {
  name: string
  taxCode: string
  website: string
  address: string
  description: string
}

export type QueuedVerificationDocument = {
  id: string
  file: File
  type: CompanyVerificationDocumentType
}
