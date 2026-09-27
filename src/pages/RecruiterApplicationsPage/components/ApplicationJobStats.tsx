import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import { AdminStatCard } from '../../_components/admin/AdminStatCard'
import type { RecruiterApplicationStats } from '../types'

type ApplicationJobStatsProps = {
  content: RecruiterApplicationsTranslations['stats']
  stats: RecruiterApplicationStats
}

function ApplicationsIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  )
}

function NewIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function InterviewIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 8h10" />
      <path d="M7 12h6" />
      <path d="M4 5h16v11H9l-5 4V5Z" />
    </svg>
  )
}

function RateIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 19h16" />
      <path d="m7 15 3-3 3 2 4-6" />
      <path d="m16 8 1 0 0 1" />
    </svg>
  )
}

/** Stat cards of the per-JD CV page (moved from the former single-tier page). */
export function ApplicationJobStats({ content, stats }: ApplicationJobStatsProps) {
  return (
    <section className="recruiter-applications-stats" aria-label={content.title}>
      <AdminStatCard delta={content.totalDelta} icon={<ApplicationsIcon />} label={content.totalLabel} tone="blue" value={stats.total} />
      <AdminStatCard delta={content.newDelta} icon={<NewIcon />} label={content.newLabel} tone="coral" value={stats.new} />
      <AdminStatCard delta={content.interviewDelta} icon={<InterviewIcon />} label={content.interviewLabel} tone="amber" value={stats.interview} />
      <AdminStatCard delta={content.responseRateDelta} icon={<RateIcon />} label={content.responseRateLabel} tone="violet" value={stats.responseRate} />
    </section>
  )
}
