import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from '../../i18n'
import { ApplicationEmptyState } from './components/ApplicationEmptyState'
import { ApplicationFilters } from './components/ApplicationFilters'
import { ApplicationList } from './components/ApplicationList'
import { ApplicationStats } from './components/ApplicationStats'
import type { ApplicationFilter } from './types'
import { createCandidateApplications, filterCandidateApplications, getApplicationStats } from './utils/applicationsData'

export function ProfileApplicationsPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.profile.applications
  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>('all')
  const applications = useMemo(() => createCandidateApplications(content.items), [content.items])
  const filteredApplications = useMemo(
    () => filterCandidateApplications(applications, activeFilter),
    [activeFilter, applications],
  )
  const stats = useMemo(() => getApplicationStats(applications), [applications])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )

  const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`))

  return (
    <div className="profile-applications-page">
      <section className="profile-applications-hero profile-card-motion">
        <div>
          <span>{content.routeLabel}</span>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <a href="/search">{content.primaryAction}</a>
      </section>

      <ApplicationStats labels={content.stats} stats={stats} />

      <section className="profile-applications-panel">
        <ApplicationFilters
          activeFilter={activeFilter}
          applications={applications}
          labels={content.filters}
          onChange={setActiveFilter}
          statusLabels={content.statusLabels}
        />

        {filteredApplications.length > 0 ? (
          <ApplicationList
            actions={content.actions}
            applications={filteredApplications}
            cvPreview={content.cvPreview}
            formatDate={formatDate}
            meta={content.meta}
            profile={pages.profile.profile}
            statusLabels={content.statusLabels}
          />
        ) : (
          <ApplicationEmptyState content={content.empty} onReset={() => setActiveFilter('all')} />
        )}
      </section>
    </div>
  )
}

export default ProfileApplicationsPage
