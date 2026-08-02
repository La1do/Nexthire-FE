import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from '../../i18n'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ApplicationDetailDrawer } from './components/ApplicationDetailDrawer'
import { ApplicationFilters } from './components/ApplicationFilters'
import { ApplicationMobileList } from './components/ApplicationMobileList'
import { ApplicationTable } from './components/ApplicationTable'
import type {
  RecruiterApplicationCriteria,
  RecruiterApplicationItem,
  RecruiterApplicationStatus,
} from './types'
import {
  computeRecruiterApplicationStats,
  recruiterApplicationsFixture,
} from './utils/recruiterApplicationsData'
import {
  filterRecruiterApplications,
  getRecruiterApplicationJobs,
  isActiveRecruiterApplicationFilters,
} from './utils/recruiterApplicationsFilters'

const PAGE_SIZE = 6

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

function updateApplicationStatus(
  applications: ReadonlyArray<RecruiterApplicationItem>,
  applicationId: string,
  status: RecruiterApplicationStatus,
) {
  return applications.map((application) =>
    application.id === applicationId
      ? {
          ...application,
          status,
          updatedAt: '22/07/2026',
          timeline: [
            ...application.timeline,
            {
              id: `${application.id}-${status}`,
              date: '22/07/2026',
              description: `Status changed to ${status}.`,
              label: 'Status updated',
            },
          ],
        }
      : application,
  )
}

export function RecruiterApplicationsPage() {
  const { pages } = useTranslations()
  const content = pages.recruiterApplications
  const [applications, setApplications] = useState<ReadonlyArray<RecruiterApplicationItem>>(recruiterApplicationsFixture)
  const [criteria, setCriteria] = useState<RecruiterApplicationCriteria>({
    jobId: 'all',
    query: '',
    sort: 'newest',
    status: 'all',
  })
  const [page, setPage] = useState(1)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const stats = useMemo(() => computeRecruiterApplicationStats(applications), [applications])
  const jobs = useMemo(() => getRecruiterApplicationJobs(applications), [applications])

  const filtered = useMemo(
    () => filterRecruiterApplications(applications, criteria),
    [applications, criteria],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  )

  useEffect(() => {
    setPage(1)
  }, [criteria.jobId, criteria.query, criteria.sort, criteria.status])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  useEffect(() => {
    if (selectedApplicationId && !applications.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(null)
    }
  }, [applications, selectedApplicationId])

  useEffect(() => {
    if (selectedApplicationId && !filtered.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(null)
    }
  }, [filtered, selectedApplicationId])

  const pagedApplications = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasActiveFilters = isActiveRecruiterApplicationFilters(criteria)

  function handleApplicationAction(prefix: string, application: RecruiterApplicationItem) {
    if (typeof window === 'undefined') {
      return
    }

    const url =
      prefix === 'mailto'
        ? `mailto:${application.candidateEmail}?subject=Regarding%20your%20application`
        : application.resumeUrl

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="recruiter-applications-page">
      <section className="recruiter-applications-hero">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h2>{content.hero.title}</h2>
          <p>{content.hero.description}</p>
        </div>
      </section>

      <section className="recruiter-applications-stats" aria-label={content.stats.title}>
        <AdminStatCard
          delta={content.stats.totalDelta}
          icon={<ApplicationsIcon />}
          label={content.stats.totalLabel}
          tone="blue"
          value={stats.total}
        />
        <AdminStatCard
          delta={content.stats.newDelta}
          icon={<NewIcon />}
          label={content.stats.newLabel}
          tone="coral"
          value={stats.new}
        />
        <AdminStatCard
          delta={content.stats.interviewDelta}
          icon={<InterviewIcon />}
          label={content.stats.interviewLabel}
          tone="amber"
          value={stats.interview}
        />
        <AdminStatCard
          delta={content.stats.responseRateDelta}
          icon={<RateIcon />}
          label={content.stats.responseRateLabel}
          tone="violet"
          value={stats.responseRate}
        />
      </section>

      <ApplicationFilters
        content={content.filters}
        hasActiveFilters={hasActiveFilters}
        jobId={criteria.jobId}
        jobs={jobs}
        onClear={() => {
          setCriteria({
            jobId: 'all',
            query: '',
            sort: 'newest',
            status: 'all',
          })
        }}
        onJobChange={(value) => setCriteria((current) => ({ ...current, jobId: value }))}
        onQueryChange={(value) => setCriteria((current) => ({ ...current, query: value }))}
        onSortChange={(value) => setCriteria((current) => ({ ...current, sort: value }))}
        onStatusChange={(value) => setCriteria((current) => ({ ...current, status: value }))}
        query={criteria.query}
        sort={criteria.sort}
        status={criteria.status}
        statusLabels={content.statusLabels}
        tabs={content.tabs}
      />

      <section className="recruiter-applications-results">
        <header className="recruiter-applications-results__header">
          <p className="recruiter-applications-results__count">
            {content.results.countLabel.replace('{{count}}', String(filtered.length))}
          </p>
        </header>

        {filtered.length === 0 ? (
          <div className="recruiter-applications-empty">
            <p className="recruiter-applications-empty__title">{content.results.emptyTitle}</p>
            <p className="recruiter-applications-empty__description">{content.results.emptyDescription}</p>
          </div>
        ) : (
          <>
            <ApplicationTable
              actions={content.results}
              applications={pagedApplications}
              columns={content.results.columns}
              handlers={{
                onEmail: (application) => handleApplicationAction('mailto', application),
                onOpenResume: (application) => handleApplicationAction('resume', application),
                onView: (application) => setSelectedApplicationId(application.id),
              }}
              statusLabels={content.statusLabels}
            />
            <ApplicationMobileList
              actions={content.results}
              applications={pagedApplications}
              columns={content.results.columns}
              handlers={{
                onEmail: (application) => handleApplicationAction('mailto', application),
                onOpenResume: (application) => handleApplicationAction('resume', application),
                onView: (application) => setSelectedApplicationId(application.id),
              }}
              statusLabels={content.statusLabels}
            />
          </>
        )}
      </section>

      <AdminPagination
        labels={content.pagination}
        onPageChange={setPage}
        page={page}
        totalPages={totalPages}
      />

      {selectedApplication ? (
        <ApplicationDetailDrawer
          application={selectedApplication}
          onClose={() => setSelectedApplicationId(null)}
          onEmail={(application) => handleApplicationAction('mailto', application)}
          onOpenResume={(application) => handleApplicationAction('resume', application)}
          onStatusChange={(applicationId, status) => {
            setApplications((currentApplications) => updateApplicationStatus(currentApplications, applicationId, status))
          }}
          statusLabels={content.statusLabels}
          translations={content.drawer}
        />
      ) : null}
    </div>
  )
}

export default RecruiterApplicationsPage
