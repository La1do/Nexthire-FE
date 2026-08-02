import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../context'
import { useLocale, useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { applicationService } from '../../services/application.service'
import { Button } from '../_components'
import { ApplicationEmptyState } from './components/ApplicationEmptyState'
import { ApplicationFilters } from './components/ApplicationFilters'
import { ApplicationList } from './components/ApplicationList'
import { ApplicationStats } from './components/ApplicationStats'
import type { ApplicationFilter, CandidateApplication } from './types'
import { filterCandidateApplications, getApplicationStats } from './utils/applicationsData'
import { createCandidateApplicationFromApi } from './utils/applicationApi'

export function ProfileApplicationsPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const toast = useToast()
  const content = pages.profile.applications
  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>('all')
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [actionError, setActionError] = useState<string | undefined>(undefined)
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

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)
    setActionError(undefined)

    try {
      const response = await applicationService.getMyApplications({ limit: 50, page: 1 })
      setApplications(
        response.data.map((application) =>
          createCandidateApplicationFromApi(
            application,
            content.meta.notAvailable,
            content.meta.noCoverLetter,
          ),
        ),
      )
    } catch (error) {
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.meta.noCoverLetter, content.meta.notAvailable, content.states.errorDescription])

  useEffect(() => {
    void loadApplications()
  }, [loadApplications])

  const formatDate = (value: string) => dateFormatter.format(new Date(value))

  async function withdrawApplication(application: CandidateApplication) {
    setActionError(undefined)

    try {
      const updatedApplication = await applicationService.withdrawMyApplication(application.id)
      const nextApplication = createCandidateApplicationFromApi(
        updatedApplication,
        content.meta.notAvailable,
        content.meta.noCoverLetter,
      )

      setApplications((currentApplications) =>
        currentApplications.map((currentApplication) =>
          currentApplication.id === application.id ? nextApplication : currentApplication,
        ),
      )
      toast.success(content.states.withdrawSuccess)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? content.states.withdrawError
      setActionError(message)
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="profile-applications-page">
        <section className="profile-application-state profile-card-motion">
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="profile-applications-page">
        <section className="profile-application-state profile-card-motion">
          <h2>{content.states.errorTitle}</h2>
          <p>{loadError}</p>
          <Button onClick={() => void loadApplications()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

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

      {actionError ? <p className="profile-api-message profile-api-message-error">{actionError}</p> : null}

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
            onLoadCv={applicationService.getMyApplicationCv}
            onWithdraw={withdrawApplication}
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
