import { useState } from 'react'
import { useLocale, useTranslations } from '../../i18n'
import { Button } from '../_components'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { CandidateDrawer } from './components/CandidateDrawer'
import { CandidateFilters } from './components/CandidateFilters'
import { CandidateList } from './components/CandidateList'
import { CandidatesStatePanel } from './components/CandidatesStatePanel'
import { CandidatesStats } from './components/CandidatesStats'
import { useCandidateCriteria } from './hooks/useCandidateCriteria'
import { useCandidates } from './hooks/useCandidates'
import './recruiter-candidates.css'
import { DEFAULT_CANDIDATE_CRITERIA } from './utils/candidateCriteria'
import { isForbiddenError } from './utils/candidateErrors'

/**
 * D5: one row per candidate with every JD they applied to in the company.
 * Scope (`cv.viewAll` → all, `cv.viewOwn` → assigned JDs only) is applied by
 * `candidatesWorkspaceService`; this page renders whatever it returns.
 */
export function RecruiterCandidatesPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterCandidates
  const applicationContent = pages.recruiterApplications
  const { criteria, page, setPage, updateCriteria } = useCandidateCriteria()
  const candidatesQuery = useCandidates({ ...criteria, page })
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const candidates = candidatesQuery.data?.data ?? []
  const meta = candidatesQuery.data?.meta

  function renderResults() {
    if (candidatesQuery.isPending) {
      return <CandidatesStatePanel title={content.states.loading} />
    }

    if (candidatesQuery.isError) {
      return isForbiddenError(candidatesQuery.error) ? (
        <CandidatesStatePanel description={content.states.forbiddenDescription} role="alert" title={content.states.forbiddenTitle} />
      ) : (
        <CandidatesStatePanel
          action={<Button onClick={() => void candidatesQuery.refetch()}>{content.states.retry}</Button>}
          description={content.states.errorDescription}
          role="alert"
          title={content.states.errorTitle}
        />
      )
    }

    if (candidates.length === 0) {
      return <CandidatesStatePanel description={content.results.emptyDescription} title={content.results.emptyTitle} />
    }

    return (
      <CandidateList
        candidates={candidates}
        locale={locale}
        matchLevelLabels={content.matchLevels}
        onOpen={setSelectedCandidateId}
        statusLabels={applicationContent.statusLabels}
        translations={content}
      />
    )
  }

  return (
    <div className="recruiter-candidates-page">
      <section className="recruiter-candidates-hero">
        <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
        <h1>{content.hero.title}</h1>
        <p>{content.hero.description}</p>
      </section>
      {candidatesQuery.isSuccess ? (
        <CandidatesStats candidates={candidates} total={meta?.total ?? 0} translations={content.stats} />
      ) : null}
      <CandidateFilters
        criteria={criteria}
        onClear={() => updateCriteria(DEFAULT_CANDIDATE_CRITERIA)}
        onCriteriaChange={updateCriteria}
        statusLabels={applicationContent.statusLabels}
        translations={content.filters}
      />
      <section aria-busy={candidatesQuery.isFetching} className="recruiter-candidates-results">
        {candidatesQuery.isSuccess ? (
          <header>
            <p>{content.results.countLabel.replace('{{count}}', String(meta?.total ?? 0))}</p>
          </header>
        ) : null}
        {renderResults()}
      </section>
      {meta ? (
        <AdminPagination
          labels={applicationContent.pagination}
          onPageChange={setPage}
          page={meta.page}
          totalPages={meta.totalPages}
        />
      ) : null}
      {selectedCandidateId ? (
        <CandidateDrawer
          candidateId={selectedCandidateId}
          locale={locale}
          matchLevelLabels={content.matchLevels}
          onClose={() => setSelectedCandidateId(null)}
          statusLabels={applicationContent.statusLabels}
          translations={content}
        />
      ) : null}
    </div>
  )
}

export default RecruiterCandidatesPage
