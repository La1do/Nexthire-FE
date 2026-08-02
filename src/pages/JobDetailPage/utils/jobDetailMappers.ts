import type { JobDetailTranslations } from '../../../i18n/types'
import type { JobWorkingType, PublicJobDetail, PublicJobListItem } from '../../../types/job.types'
import {
  formatDate,
  formatPostedAt,
  formatSalary,
  initials,
  pickTone,
  type PostedLabels,
} from '../../_utils/jobFormat'
import type { JobDetailSectionView, JobDetailView, JobLogoView } from '../types'

// Labels the mappers need from i18n so no user-facing text is hardcoded here.
export type JobDetailLabels = PostedLabels & {
  workingType: Record<JobWorkingType, string>
  salaryNegotiable: string
}

function mapLogo(companyId: string, company: string, logoUrl: string | null): JobLogoView {
  return {
    alt: `${company} logo`,
    fallbackText: initials(company),
    src: logoUrl ?? '',
    tone: pickTone(companyId || company),
  }
}

export function mapJobDetail(
  job: PublicJobDetail,
  locale: string,
  labels: JobDetailLabels,
): JobDetailView {
  const company = job.companyName ?? '—'

  return {
    id: job.id,
    companyId: job.companyId,
    company,
    title: job.title,
    location: job.location,
    workMode: labels.workingType[job.workingType] ?? job.workingType,
    salary: formatSalary(job, locale, labels.salaryNegotiable),
    postedAt: formatPostedAt(job.publishedAt, locale, labels),
    deadline: formatDate(job.deadline, locale) || null,
    openings: job.numberOfOpenings,
    tags: job.skills,
    verified: true,
    logo: mapLogo(job.companyId, company, job.companyLogoUrl),
  }
}

// Build the rendered content blocks from the long-form API fields. Section
// titles come from i18n; bodies come from the job. Empty fields are skipped.
export function mapJobDetailSections(
  job: PublicJobDetail,
  titles: JobDetailTranslations['sections'],
): ReadonlyArray<JobDetailSectionView> {
  const blocks: ReadonlyArray<{ title: string; body: string | null }> = [
    { title: titles.description, body: job.description },
    { title: titles.requirements, body: job.requirements },
    { title: titles.benefits, body: job.benefits },
  ]

  return blocks
    .filter((block): block is JobDetailSectionView => Boolean(block.body?.trim()))
    .map((block) => ({ title: block.title, body: block.body }))
}

export function mapRelatedJob(job: PublicJobListItem) {
  const company = job.companyName ?? '—'

  return {
    id: job.id,
    companyId: job.companyId,
    company,
    title: job.title,
    location: job.location,
    logo: mapLogo(job.companyId, company, job.companyLogoUrl),
  }
}
