import type { SavedJobItem, SavedJobStatus } from '../../../types/savedJob.types'
import {
  formatPostedAt,
  formatSalary,
  initials,
  pickTone,
} from '../../_utils/jobFormat'
import type { JobCardView } from '../../HomePage/types'

export type SavedJobListLabels = {
  workingType: Record<string, string>
  salaryNegotiable: string
  postedJustNow: string
  postedPrefix: string
  postedSuffix: string
}

export function mapSavedJobToCard(
  item: SavedJobItem,
  locale: string,
  labels: SavedJobListLabels,
): JobCardView {
  const company = item.companyName ?? '—'

  return {
    id: item.jobId,
    companyId: item.companyId,
    company,
    title: item.title,
    location: item.location,
    workMode: labels.workingType[item.experienceLevel] ?? item.experienceLevel,
    workingType: 'ONSITE',
    salary: formatSalary(
      {
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        salaryCurrency: item.salaryCurrency,
        isSalaryVisible: item.isSalaryVisible,
      },
      locale,
      labels.salaryNegotiable,
    ),
    salarySortValue: item.isSalaryVisible ? item.salaryMax ?? item.salaryMin ?? 0 : 0,
    postedAt: formatPostedAt(item.publishedAt, locale, labels),
    postedSortValue: item.publishedAt ? new Date(item.publishedAt).getTime() : 0,
    tags: [],
    categoryId: null,
    verified: false,
    badgeTone: item.isSalaryVisible && item.salaryMin != null ? 'pink' : 'blue',
    logo: {
      alt: `${company} logo`,
      fallbackText: initials(company),
      src: item.companyLogoUrl ?? '',
      tone: pickTone(item.companyId || company),
    },
  }
}

export function savedJobStatusLabelKey(status: SavedJobStatus): 'published' | 'unpublished' | 'closed' | 'expired' | 'rejected' {
  switch (status) {
    case 'PUBLISHED':
      return 'published'
    case 'UNPUBLISHED':
      return 'unpublished'
    case 'CLOSED':
      return 'closed'
    case 'EXPIRED':
      return 'expired'
    case 'REJECTED':
      return 'rejected'
  }
}
