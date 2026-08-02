import type { AdminJobsTranslations } from '../../../i18n/types'

type Props = { labels: AdminJobsTranslations['statuses']; status: string }

export function AdminJobStatusBadge({ labels, status }: Props) {
  return <span className={`admin-job-status admin-job-status--${status.toLowerCase()}`}><i aria-hidden="true" />{labels[status] ?? status}</span>
}
