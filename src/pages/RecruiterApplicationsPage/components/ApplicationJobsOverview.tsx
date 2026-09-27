import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslations } from '../../../i18n'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { Button } from '../../_components'
import { useApplicationJobs } from '../hooks/useApplicationJobs'
import { useLegacyApplicationsRedirect } from '../hooks/useLegacyApplicationsRedirect'
import type { ApplicationJobListFilters } from '../types'
import { isForbiddenError } from '../utils/applicationAccessErrors'
import { ApplicationJobList } from './ApplicationJobList'
import { ApplicationJobsToolbar } from './ApplicationJobsToolbar'
import { ApplicationsStatePanel } from './ApplicationsStatePanel'

const SEARCH_DEBOUNCE_MS = 300

/** Tier 1: list of JDs the current member can see, with CV counts per stage. */
export function ApplicationJobsOverview() {
  const content = useTranslations().pages.recruiterApplications
  const { isRedirecting } = useLegacyApplicationsRedirect()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('search') ?? ''
  const staffId = searchParams.get('staff')?.trim() || 'all'
  const [queryInput, setQueryInput] = useState(urlQuery)
  const filters = useMemo<ApplicationJobListFilters>(() => ({ query: urlQuery, staffId }), [staffId, urlQuery])
  const { canFilterByStaff, jobsQuery, staffFilterPermission, staffMembersQuery } = useApplicationJobs(filters)
  const jobs = jobsQuery.data?.jobs ?? []
  const hasActiveFilters = queryInput.trim().length > 0 || (canFilterByStaff && staffId !== 'all')

  useEffect(() => {
    const nextQuery = queryInput.trim()

    if (nextQuery === urlQuery) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams)

        if (nextQuery) {
          nextParams.set('search', nextQuery)
        } else {
          nextParams.delete('search')
        }

        return nextParams
      }, { replace: true })
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [queryInput, setSearchParams, urlQuery])

  function handleStaffChange(value: string) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (value === 'all') {
        nextParams.delete('staff')
      } else {
        nextParams.set('staff', value)
      }

      return nextParams
    }, { replace: true })
  }

  function handleClear() {
    setQueryInput('')
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.delete('search')
      nextParams.delete('staff')
      return nextParams
    }, { replace: true })
  }

  function renderResults() {
    if (jobsQuery.isPending) {
      return <ApplicationsStatePanel title={content.jobList.loading} />
    }

    if (jobsQuery.isError && !jobsQuery.data && isForbiddenError(jobsQuery.error)) {
      return (
        <ApplicationsStatePanel
          description={content.jobList.forbiddenDescription}
          role="alert"
          title={content.jobList.forbiddenTitle}
        />
      )
    }

    if (jobsQuery.isError && !jobsQuery.data) {
      return (
        <ApplicationsStatePanel
          action={<Button onClick={() => void jobsQuery.refetch()}>{content.jobList.retry}</Button>}
          description={getApiErrorEnvelope(jobsQuery.error)?.error.message ?? content.jobList.errorDescription}
          role="alert"
          title={content.jobList.errorTitle}
        />
      )
    }

    if (jobs.length === 0) {
      return hasActiveFilters ? (
        <ApplicationsStatePanel
          description={content.jobList.emptyFilteredDescription}
          title={content.jobList.emptyFilteredTitle}
        />
      ) : (
        <ApplicationsStatePanel description={content.jobList.emptyDescription} title={content.jobList.emptyTitle} />
      )
    }

    return <ApplicationJobList content={content.jobList} jobs={jobs} statusLabels={content.jobStatusLabels} />
  }

  if (isRedirecting) {
    return (
      <div className="recruiter-applications-page">
        <ApplicationsStatePanel title={content.states.loading} />
      </div>
    )
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

      <ApplicationJobsToolbar
        canFilterByStaff={canFilterByStaff}
        content={content.jobList}
        hasActiveFilters={hasActiveFilters}
        onClear={handleClear}
        onQueryChange={setQueryInput}
        onStaffChange={handleStaffChange}
        query={queryInput}
        staffId={staffId}
        staffFilterPermission={staffFilterPermission}
        staffMembers={{
          isError: staffMembersQuery.isError,
          isLoading: staffMembersQuery.isPending && staffMembersQuery.fetchStatus !== 'idle',
          options: staffMembersQuery.data ?? [],
          retry: () => void staffMembersQuery.refetch(),
        }}
      />

      <section className="recruiter-applications-results" aria-busy={jobsQuery.isFetching}>
        <header className="recruiter-applications-results__header">
          <p className="recruiter-applications-results__count">
            {content.jobList.countLabel.replace('{{count}}', String(jobs.length))}
          </p>
        </header>

        {renderResults()}
      </section>
    </div>
  )
}
