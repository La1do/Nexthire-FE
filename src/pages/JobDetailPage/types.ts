import type { LogoTone } from '../_utils/jobFormat'

// View-models mapped from the public job detail API into the shapes the
// Job Detail components render. Static UI text stays in i18n.

export type JobLogoView = {
  alt: string
  fallbackText: string
  src: string
  tone: LogoTone
}

export type JobCompanyInfo = {
  id: string
  name: string
  logoUrl?: string | null
  scale?: string | null
  address?: string | null
  industry?: string | null
}

export type JobDetailOverviewData = {
  requirements: string[]
  benefits: string[]
  benefitsRow2?: string[]
  specialties: string[]
}

export type JobDetailHighlightBox = {
  iconType: 'knowledge' | 'requiredSkill' | 'preferredSkill' | 'benefit'
  label: string
  value: string
}

export type JobDetailLocationTime = {
  workLocation: string
  workHours: string[]
  applyNote: string
}

export type JobDetailView = {
  id: string
  companyId: string
  company: string
  title: string
  location: string
  workMode: string
  salary: string
  postedAt: string
  deadline: string | null
  openings: number | null
  tags: ReadonlyArray<string>
  verified: boolean
  logo: JobLogoView
  // TopCV styling enhancements
  experienceLevelLabel?: string
  categoryName?: string
  overview?: JobDetailOverviewData
  candidateNote?: string
  candidateHighlights?: JobDetailHighlightBox[]
  supplementalBenefits?: string[]
  locationTime?: JobDetailLocationTime
  companyInfo?: JobCompanyInfo
  levelLabel?: string
  educationLabel?: string
  employmentTypeLabel?: string
}

export type JobDetailSectionKey = 'description' | 'requirements' | 'benefits' | 'location_time'

// One rendered content block (description / requirements / benefits).
export type JobDetailSectionView = {
  key?: JobDetailSectionKey
  title: string
  body: string
}

export type RelatedJobView = {
  id: string
  companyId: string
  company: string
  title: string
  location: string
  logo: JobLogoView
  salary?: string
}
