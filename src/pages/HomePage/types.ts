import type { JobWorkingType } from '../../types/job.types'

// View-models mapped from public API responses into shapes the Home
// components render. Static UI text stays in i18n; these carry dynamic data.

export type LogoTone = 'blue' | 'coral' | 'green' | 'violet'

export type CategoryIconKind = 'all' | 'briefcase' | 'code' | 'data' | 'design' | 'marketing' | 'support'

export type JobCardView = {
  id: string
  companyId: string
  company: string
  title: string
  location: string
  workMode: string
  workingType: JobWorkingType
  salary: string
  salarySortValue: number
  postedAt: string
  postedSortValue: number
  tags: ReadonlyArray<string>
  categoryId: string | null
  verified: boolean
  badgeTone: 'blue' | 'pink'
  logo: {
    alt: string
    fallbackText: string
    src: string
    tone: LogoTone
  }
}

export type FeaturedCompanyView = {
  companyId: string
  name: string
  openRoles: string
  logo: {
    alt: string
    fallbackText: string
    src: string
    tone: LogoTone
  }
}

export type CategoryView = {
  id: string
  title: string
  count: string
  icon: CategoryIconKind
}

export type HeroStatView = {
  value: string
  label: string
}

export type IndustryGroupView = {
  categoryId: string | null
  title: string
  jobs: ReadonlyArray<JobCardView>
}
