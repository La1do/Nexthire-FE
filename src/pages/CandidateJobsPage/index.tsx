import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from '../../i18n'
import { formatDate } from '../_utils/jobFormat'
import { Button } from '../_components'
import { CandidateJobsEmptyState } from './components/CandidateJobsEmptyState'
import { CandidateJobsFilters } from './components/CandidateJobsFilters'
import { CandidateJobsHero } from './components/CandidateJobsHero'
import { CandidateJobRow } from './components/CandidateJobRow'
import {
  filterCandidateManagedJobs,
  sortCandidateManagedJobs,
  useCandidateManagedJobs,
} from './hooks/useCandidateManagedJobs'
import type { CandidateManagedJobFilter, CandidateManagedJobSort } from './types'
import './candidate-jobs.css'

export function CandidateJobsPage() {
  const { locale } = useLocale()
  const { common, pages } = useTranslations()
  const content = pages.profile.managedJobs
  const [activeFilter, setActiveFilter] = useState<CandidateManagedJobFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<CandidateManagedJobSort>('newest')
  const dataOptions = useMemo(
    () => ({
      fallbackLabel: content.meta.notAvailable,
      locale,
      salaryNegotiableLabel: common.job.salaryNegotiable,
    }),
    [common.job.salaryNegotiable, content.meta.notAvailable, locale],
  )
  const state = useCandidateManagedJobs(dataOptions)
  const jobs = useMemo(
    () => sortCandidateManagedJobs(filterCandidateManagedJobs(state.jobs, activeFilter, searchQuery), sort),
    [activeFilter, searchQuery, sort, state.jobs],
  )

  function formatDateLabel(value: string | null | undefined) {
    return formatDate(value ?? null, locale) || content.meta.notAvailable
  }

  function resetFilters() {
    setActiveFilter('all')
    setSearchQuery('')
    setSort('newest')
  }

  function showSavedJobs() {
    setActiveFilter('saved')
    setSearchQuery('')
  }

  const emptyState = getEmptyState({
    activeFilter,
    content,
    hasSearch: searchQuery.trim().length > 0,
    hasVisibleJobs: jobs.length > 0,
    onResetFilters: resetFilters,
    onShowSavedJobs: showSavedJobs,
    totalJobs: state.jobs.length,
  })

  if (state.isLoading) {
    return (
      <div className="candidate-jobs-page">
        <section className="candidate-jobs-state">
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="candidate-jobs-page">
        <section className="candidate-jobs-state">
          <h2>{content.states.errorTitle}</h2>
          <p>{state.error || content.states.errorDescription}</p>
          <Button onClick={() => void state.reload()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

  return (
    <div className="candidate-jobs-page">
      <CandidateJobsHero content={content} stats={state.stats} />

      {state.actionError ? <p className="candidate-jobs-action-error">{state.actionError}</p> : null}

      <CandidateJobsFilters
        activeFilter={activeFilter}
        content={content}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
        onSortChange={setSort}
        searchQuery={searchQuery}
        sort={sort}
        tabCounts={state.tabCounts}
      />

      <section className="candidate-jobs-list-panel" aria-label={content.listLabel}>
        {jobs.length > 0 ? (
          <div className="candidate-jobs-list">
            {jobs.map((job) => (
              <CandidateJobRow
                content={content}
                formatDate={formatDateLabel}
                isRemovingSavedJob={state.removingSavedJobId === job.jobId}
                isWithdrawingApplication={state.withdrawingApplicationId === job.applicationId}
                job={job}
                key={job.jobId}
                onRemoveSavedJob={(jobId) => state.removeSavedJob(jobId, content.states.removeSavedError)}
                onWithdrawApplication={(managedJob) =>
                  state.withdrawApplication(managedJob, content.states.withdrawError)
                }
              />
            ))}
          </div>
        ) : (
          <CandidateJobsEmptyState {...emptyState} />
        )}
      </section>
    </div>
  )
}

type EmptyStateConfig = {
  activeFilter: CandidateManagedJobFilter
  content: ReturnType<typeof useTranslations>['pages']['profile']['managedJobs']
  hasSearch: boolean
  hasVisibleJobs: boolean
  onResetFilters: () => void
  onShowSavedJobs: () => void
  totalJobs: number
}

function getEmptyState({
  activeFilter,
  content,
  hasSearch,
  hasVisibleJobs,
  onResetFilters,
  onShowSavedJobs,
  totalJobs,
}: EmptyStateConfig) {
  if (hasVisibleJobs) {
    return {
      actionLabel: content.empty.filterAction,
      description: content.empty.filterDescription,
      onAction: onResetFilters,
      title: content.empty.filterTitle,
    }
  }

  if (activeFilter === 'saved' && !hasSearch) {
    return {
      actionHref: '/search',
      actionLabel: content.empty.savedAction,
      description: content.empty.savedDescription,
      title: content.empty.savedTitle,
    }
  }

  if (activeFilter === 'applied' && !hasSearch) {
    return {
      actionLabel: content.empty.appliedAction,
      description: content.empty.appliedDescription,
      onAction: onShowSavedJobs,
      title: content.empty.appliedTitle,
    }
  }

  if (totalJobs === 0 && !hasSearch) {
    return {
      actionHref: '/search',
      actionLabel: content.empty.allAction,
      description: content.empty.allDescription,
      title: content.empty.allTitle,
    }
  }

  return {
    actionLabel: content.empty.filterAction,
    description: content.empty.filterDescription,
    onAction: onResetFilters,
    title: content.empty.filterTitle,
  }
}

export default CandidateJobsPage
