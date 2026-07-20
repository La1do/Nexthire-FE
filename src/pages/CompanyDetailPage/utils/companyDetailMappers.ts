import type { CompanyDetailProfile, CompanyDetailTranslations } from '../../../i18n/types'
import type { PublicCompanyProfile } from '../../../types/company.types'
import type { PublicJobListItem } from '../../../types/job.types'
import type { JobCardView, LogoTone } from '../../HomePage/types'
import { mapJobToCard, type JobLabels } from '../../HomePage/utils/homeMappers'
import { initials, pickTone } from '../../_utils/jobFormat'

export type CompanyDetailViewModel = Omit<
  CompanyDetailProfile,
  'culture' | 'heroImage' | 'mission' | 'perks' | 'values'
> & {
  culture: string | null
  heroImageUrl: string | null
  isVerified: boolean
  logo: {
    alt: string
    fallbackText: string
    src: string
    tone: LogoTone
  }
  mission: string | null
  openJobs: ReadonlyArray<JobCardView>
  perks: ReadonlyArray<string>
  values: ReadonlyArray<string>
  id: string
}

function cleanOptionalString(value: string | null | undefined) {
  const nextValue = value?.trim()

  return nextValue || null
}

function cleanList(values: ReadonlyArray<string> | null | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean)
}

export function mapCompanyDetail(
  profile: PublicCompanyProfile,
  openJobsRaw: ReadonlyArray<PublicJobListItem>,
  fallback: CompanyDetailTranslations['fallbackProfile'],
  locale: string,
  jobLabels: JobLabels,
): CompanyDetailViewModel {
  const openJobs = openJobsRaw.map((job) => mapJobToCard(job, locale, jobLabels))

  return {
    // Generic copy fills legacy facts that the public endpoint does not expose yet.
    ...fallback,
    // Real data from the public company endpoint wins where available.
    name: profile.name,
    description: cleanOptionalString(profile.description) ?? fallback.description,
    website: cleanOptionalString(profile.website) ?? '',
    location: cleanOptionalString(profile.address) ?? fallback.location,
    mission: cleanOptionalString(profile.mission),
    culture: cleanOptionalString(profile.culture),
    values: cleanList(profile.values),
    perks: cleanList(profile.perks),
    heroImageUrl: cleanOptionalString(profile.heroImageUrl),
    // Only approved companies are exposed by the public endpoint.
    isVerified: true,
    logo: {
      alt: `${profile.name} logo`,
      fallbackText: initials(profile.name),
      src: profile.logo ?? '',
      tone: pickTone(profile.id || profile.name),
    },
    openJobs,
    id: profile.id,
  }
}
