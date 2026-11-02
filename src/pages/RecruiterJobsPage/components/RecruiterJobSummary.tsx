import { AdminShieldIcon, ArchiveIcon, RestoreIcon, SuspendIcon } from '../../../assets/icons/admin'
import type { RecruiterJobsTranslations } from '../../../i18n/types'
import type { RecruiterJobStatusCounts } from '../../../types/job.types'
import { AdminStatCard } from '../../_components/admin/AdminStatCard'

type RecruiterJobSummaryProps = {
  counts: RecruiterJobStatusCounts
  locale: string
  translations: RecruiterJobsTranslations
}

export function RecruiterJobSummary({
  counts,
  translations,
}: RecruiterJobSummaryProps) {
  const totalJobs = Object.values(counts).reduce((total, count) => total + count, 0)
  const needsActionCount = counts.DRAFT + counts.NEEDS_REVIEW + counts.SHOULD_REJECT + counts.REJECTED
  const publishedCount = counts.PUBLISHED
  const closingCount = counts.UNPUBLISHED + counts.CLOSED + counts.EXPIRED

  return (
    <div className="admin-users-stats admin-jobs-stats" aria-label={translations.summary.label}>
      <AdminStatCard
        delta={translations.summary.totalDescription}
        icon={<ArchiveIcon />}
        label={translations.summary.total}
        tone="blue"
        value={totalJobs}
      />
      <AdminStatCard
        delta={translations.summary.needsActionDescription}
        icon={<AdminShieldIcon />}
        label={translations.summary.needsAction}
        tone="amber"
        value={needsActionCount}
      />
      <AdminStatCard
        delta={translations.summary.publishedDescription}
        icon={<RestoreIcon />}
        label={translations.summary.published}
        tone="coral"
        value={publishedCount}
      />
      <AdminStatCard
        delta={translations.summary.inactiveDescription}
        icon={<SuspendIcon />}
        label={translations.summary.inactive}
        tone="violet"
        value={closingCount}
      />
    </div>
  )
}