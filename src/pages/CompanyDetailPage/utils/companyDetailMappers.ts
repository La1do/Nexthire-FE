import type { CompanyDetailProfile, CompanyDetailTranslations } from '../../../i18n/types'
import type { PublicCompanyProfile } from '../../../types/company.types'
import type { PublicJobListItem } from '../../../types/job.types'
import type { JobCardView, LogoTone } from '../../HomePage/types'
import { mapJobToCard, type JobLabels } from '../../HomePage/utils/homeMappers'
import { initials, pickTone } from '../../_utils/jobFormat'

// Fields the public company API cannot provide (culture, mission, size, ...)
// fall back to the localized generic profile copy.
export type CompanyDetailViewModel = CompanyDetailProfile & {
  isVerified: boolean
  logo: {
    alt: string
    fallbackText: string
    src: string
    tone: LogoTone
  }
  openJobs: ReadonlyArray<JobCardView>
  id: string
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
    // Non-API sections keep the generic localized copy.
    ...fallback,
    // Real data from the public company endpoint wins where available.
    name: profile.name,
    description: profile.description ?? fallback.description,
    website: profile.website ?? '',
    location: profile.address ?? fallback.location,
    // The API has no company imagery; keep a stable seeded placeholder.
    heroImage: `https://picsum.photos/seed/${profile.id}-company-workspace/960/640`,
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
