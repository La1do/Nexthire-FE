import type { LogoTone } from '../_utils/jobFormat'

// View-models mapped from the public job detail API into the shapes the
// Job Detail components render. Static UI text stays in i18n.

export type JobLogoView = {
  alt: string
  fallbackText: string
  src: string
  tone: LogoTone
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
}

// One rendered content block (description / requirements / benefits).
export type JobDetailSectionView = {
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
}
