import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLocale, useTranslations } from '../../i18n'
import type { RecruiterCandidatesTranslations } from '../../i18n/types'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { applicationService } from '../../services/application.service'
import type {
  ApplicationMatchLevel,
  ApplicationStatus,
  RecruiterCandidateDetailResponse,
  RecruiterCandidateResponse,
} from '../../types/application.types'
import { Button, SelectField } from '../_components'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import './recruiter-candidates.css'

const PAGE_SIZE = 12

type CandidateSort = 'lastAppliedAt' | 'bestMatchScore' | 'applicationCount' | 'candidateName'

type CandidateCriteria = {
  query: string
  sort: CandidateSort
  status: ApplicationStatus | 'all'
}

const statusOrder: ReadonlyArray<ApplicationStatus> = ['SUBMITTED', 'OFFERED', 'REJECTED', 'CANCELLED']

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

function readCriteria(searchParams: URLSearchParams): CandidateCriteria {
  const status = searchParams.get('status')
  const sort = searchParams.get('sort')

  return {
    query: searchParams.get('search') ?? '',
    sort: sort === 'bestMatchScore' || sort === 'applicationCount' || sort === 'candidateName'
      ? sort
      : 'lastAppliedAt',
    status: status === 'SUBMITTED' ||
      status === 'OFFERED' ||
      status === 'REJECTED' ||
      status === 'CANCELLED'
      ? status
      : 'all',
  }
}

function formatDate(value: string, locale: string, fallback: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatMatch(
  score: number | null,
  level: ApplicationMatchLevel | null,
  fallback: string,
  levelLabels: Record<ApplicationMatchLevel, string>,
) {
  if (score == null) {
    return fallback
  }

  return level ? `${score} · ${levelLabels[level]}` : String(score)
}

function CandidateMatchBadge({
  fallback,
  level,
  levelLabels,
  score,
}: {
  fallback: string
  level: ApplicationMatchLevel | null
  levelLabels: Record<ApplicationMatchLevel, string>
  score: number | null
}) {
  if (score == null) {
    return <span className="recruiter-candidate-match-badge recruiter-candidate-match-badge--empty">{fallback}</span>
  }

  const levelClassName = level?.toLowerCase() ?? 'scored'

  return (
    <span className={`recruiter-candidate-match-badge recruiter-candidate-match-badge--${levelClassName}`}>
      <strong>{score}%</strong>
      {level ? <span>{levelLabels[level]}</span> : null}
    </span>
  )
}

function createApplicationHref(applicationId: string, jobId?: string | null) {
  const params = new URLSearchParams({ applicationId })

  if (jobId) {
    params.set('jobId', jobId)
  }

  return `/recruiter/applications?${params.toString()}`
}

function CandidateIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CandidateFilters({
  criteria,
  onClear,
  onCriteriaChange,
  statusLabels,
  translations,
}: {
  criteria: CandidateCriteria
  onClear: () => void
  onCriteriaChange: (criteria: CandidateCriteria) => void
  statusLabels: Record<ApplicationStatus, string>
  translations: RecruiterCandidatesTranslations['filters']
}) {
  return (
    <section className="recruiter-candidates-filters" aria-label={translations.searchLabel}>
      <label className="recruiter-candidates-search">
        <span className="sr-only">{translations.searchLabel}</span>
        <input
          onChange={(event) => onCriteriaChange({ ...criteria, query: event.target.value })}
          placeholder={translations.searchPlaceholder}
          type="search"
          value={criteria.query}
        />
      </label>
      <SelectField
        className="recruiter-candidates-select"
        label={translations.statusLabel}
        onChange={(value) => onCriteriaChange({ ...criteria, status: value as ApplicationStatus | 'all' })}
        options={[
          { label: translations.allStatuses, value: 'all' },
          ...statusOrder.map((status) => ({ label: statusLabels[status], value: status })),
        ]}
        value={criteria.status}
      />
      <SelectField
        className="recruiter-candidates-select"
        label={translations.sortLabel}
        onChange={(value) => onCriteriaChange({ ...criteria, sort: value as CandidateSort })}
        options={[
          { label: translations.sortOptions.lastAppliedAt, value: 'lastAppliedAt' },
          { label: translations.sortOptions.bestMatchScore, value: 'bestMatchScore' },
          { label: translations.sortOptions.applicationCount, value: 'applicationCount' },
          { label: translations.sortOptions.candidateName, value: 'candidateName' },
        ]}
        value={criteria.sort}
      />
      <Button onClick={onClear} type="button" variant="secondary">
        {translations.clear}
      </Button>
    </section>
  )
}

function CandidateCard({
  candidate,
  locale,
  onOpen,
  matchLevelLabels,
  statusLabels,
  translations,
}: {
  candidate: RecruiterCandidateResponse
  locale: string
  matchLevelLabels: Record<ApplicationMatchLevel, string>
  onOpen: (candidateId: string) => void
  statusLabels: Record<ApplicationStatus, string>
  translations: RecruiterCandidatesTranslations
}) {
  const skillPreview = candidate.skills.slice(0, 4)

  return (
    <article className="recruiter-candidate-card">
      <button
        aria-label={`${translations.results.viewProfile}: ${candidate.fullName}`}
        className="recruiter-candidate-card__main"
        onClick={() => onOpen(candidate.candidateId)}
        type="button"
      >
        <span className="recruiter-candidate-avatar">
          {candidate.avatarUrl ? <img alt="" src={candidate.avatarUrl} /> : getInitials(candidate.fullName)}
        </span>
        <span>
          <strong>{candidate.fullName}</strong>
          <small>{candidate.headline || candidate.email}</small>
          <span className="recruiter-candidate-card__skills">
            {skillPreview.length
              ? skillPreview.map((skill) => <span key={skill.name}>{skill.name}</span>)
              : <span>{translations.detail.noSkills}</span>}
          </span>
        </span>
      </button>
      <div className="recruiter-candidate-card__latest-job">
        <strong title={candidate.latestJobTitle}>{candidate.latestJobTitle}</strong>
      </div>
      <span className={`recruiter-application-status recruiter-application-status--${candidate.latestStatus}`}>
        {statusLabels[candidate.latestStatus]}
      </span>
      <CandidateMatchBadge
        fallback={translations.detail.noData}
        level={candidate.bestMatchLevel}
        levelLabels={matchLevelLabels}
        score={candidate.bestMatchScore}
      />
      <time className="recruiter-candidate-card__date" dateTime={candidate.lastAppliedAt}>
        {formatDate(candidate.lastAppliedAt, locale, translations.detail.noData)}
      </time>
      <footer>
        <button onClick={() => onOpen(candidate.candidateId)} type="button">
          <span>{translations.results.viewProfile}</span>
          <small>{translations.results.applicationCount.replace('{{count}}', String(candidate.applicationCount))}</small>
        </button>
      </footer>
    </article>
  )
}

function CandidateDrawer({
  candidate,
  locale,
  onClose,
  matchLevelLabels,
  statusLabels,
  translations,
}: {
  candidate: RecruiterCandidateDetailResponse
  locale: string
  matchLevelLabels: Record<ApplicationMatchLevel, string>
  onClose: () => void
  statusLabels: Record<ApplicationStatus, string>
  translations: RecruiterCandidatesTranslations
}) {
  return (
    <div className="recruiter-candidate-drawer" role="dialog" aria-modal="true" aria-label={translations.detail.title}>
      <button className="recruiter-candidate-drawer__backdrop" onClick={onClose} type="button" />
      <aside className="recruiter-candidate-drawer__panel">
        <header>
          <div className="recruiter-candidate-drawer__identity">
            <span className="recruiter-candidate-avatar recruiter-candidate-avatar--large">
              {candidate.avatarUrl ? <img alt="" src={candidate.avatarUrl} /> : getInitials(candidate.fullName)}
            </span>
            <div>
              <p>{translations.detail.title}</p>
              <h2>{candidate.fullName}</h2>
              <span>{candidate.headline || candidate.email}</span>
            </div>
          </div>
          <button aria-label={translations.detail.close} onClick={onClose} type="button">×</button>
        </header>
        <dl className="recruiter-candidate-drawer__summary">
          <div>
            <dt>{translations.detail.applications}</dt>
            <dd>{candidate.applications.length}</dd>
          </div>
          <div>
            <dt>{translations.results.bestMatch}</dt>
            <dd>{formatMatch(candidate.bestMatchScore, candidate.bestMatchLevel, translations.detail.noData, matchLevelLabels)}</dd>
          </div>
          <div>
            <dt>{translations.results.lastApplied}</dt>
            <dd>{formatDate(candidate.lastAppliedAt, locale, translations.detail.noData)}</dd>
          </div>
        </dl>
        <section>
          <h3>{translations.detail.contact}</h3>
          <dl className="recruiter-candidate-drawer__facts">
            <div><dt>Email</dt><dd>{candidate.email}</dd></div>
            <div><dt>Phone</dt><dd>{candidate.phone || translations.detail.noData}</dd></div>
            <div><dt>Location</dt><dd>{candidate.location || translations.detail.noData}</dd></div>
          </dl>
        </section>
        <section>
          <h3>{translations.detail.skills}</h3>
          <div className="recruiter-candidate-drawer__skills">
            {candidate.skills.length ? candidate.skills.map((skill) => (
              <span key={`${skill.name}-${skill.level ?? 'level'}`}>
                {skill.name}{skill.level ? ` · ${skill.level}` : ''}
              </span>
            )) : <p>{translations.detail.noSkills}</p>}
          </div>
        </section>
        <section>
          <h3>{translations.detail.applications}</h3>
          <div className="recruiter-candidate-history">
            {candidate.applications.map((application) => (
              <Link key={application.id} to={createApplicationHref(application.id, application.jobId)}>
                <span>
                  <strong>{application.jobTitle}</strong>
                  <small>{formatDate(application.submittedAt, locale, translations.detail.noData)}</small>
                </span>
                <span className={`recruiter-application-status recruiter-application-status--${application.status}`}>
                  {statusLabels[application.status]}
                </span>
                <b>{formatMatch(application.matchScore, application.matchLevel, translations.detail.noData, matchLevelLabels)}</b>
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}

export function RecruiterCandidatesPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterCandidates
  const applicationContent = pages.recruiterApplications
  const [searchParams, setSearchParams] = useSearchParams()
  const [criteria, setCriteria] = useState<CandidateCriteria>(() => readCriteria(searchParams))
  const [candidates, setCandidates] = useState<RecruiterCandidateResponse[]>([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidateDetailResponse | null>(null)

  const loadCandidates = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    try {
      const response = await applicationService.getRecruiterCandidates({
        limit: PAGE_SIZE,
        page: meta.page,
        search: criteria.query.trim() || undefined,
        sortBy: criteria.sort,
        sortOrder: criteria.sort === 'candidateName' ? 'asc' : 'desc',
        status: criteria.status === 'all' ? undefined : criteria.status,
      })
      setCandidates(response.data)
      setMeta(response.meta)
    } catch (loadError) {
      setError(getApiErrorEnvelope(loadError)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.errorDescription, criteria, meta.page])

  useEffect(() => {
    void loadCandidates()
  }, [loadCandidates])

  useEffect(() => {
    const nextCriteria = readCriteria(searchParams)
    setCriteria((current) => (
      current.query === nextCriteria.query && current.sort === nextCriteria.sort && current.status === nextCriteria.status
        ? current
        : nextCriteria
    ))
  }, [searchParams])

  const stats = useMemo(() => {
    const applications = candidates.reduce((total, candidate) => total + candidate.applicationCount, 0)
    const strongMatches = candidates.filter((candidate) => (candidate.bestMatchScore ?? 0) >= 70).length
    return { applications, strongMatches }
  }, [candidates])

  function updateCriteria(nextCriteria: CandidateCriteria) {
    setCriteria(nextCriteria)
    setMeta((current) => ({ ...current, page: 1 }))
    setSearchParams(() => {
      const nextParams = new URLSearchParams()
      if (nextCriteria.query.trim()) nextParams.set('search', nextCriteria.query.trim())
      if (nextCriteria.status !== 'all') nextParams.set('status', nextCriteria.status)
      if (nextCriteria.sort !== 'lastAppliedAt') nextParams.set('sort', nextCriteria.sort)
      return nextParams
    }, { replace: true })
  }

  async function openCandidate(candidateId: string) {
    try {
      setSelectedCandidate(await applicationService.getRecruiterCandidate(candidateId))
    } catch (detailError) {
      setError(getApiErrorEnvelope(detailError)?.error.message ?? content.states.detailError)
    }
  }

  if (isLoading && candidates.length === 0) {
    return <section className="recruiter-candidates-empty"><p>{content.states.loading}</p></section>
  }

  if (error) {
    return (
      <section className="recruiter-candidates-empty">
        <h2>{content.states.errorTitle}</h2>
        <p>{error}</p>
        <Button onClick={() => void loadCandidates()}>{content.states.retry}</Button>
      </section>
    )
  }

  return (
    <div className="recruiter-candidates-page">
      <section className="recruiter-candidates-hero">
        <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
        <h1>{content.hero.title}</h1>
        <p>{content.hero.description}</p>
      </section>
      <section className="recruiter-candidates-stats">
        <AdminStatCard icon={<CandidateIcon />} label={content.stats.candidates} tone="blue" value={meta.total} />
        <AdminStatCard icon={<CandidateIcon />} label={content.stats.applications} tone="coral" value={stats.applications} />
        <AdminStatCard icon={<CandidateIcon />} label={content.stats.strongMatches} tone="violet" value={stats.strongMatches} />
      </section>
      <CandidateFilters
        criteria={criteria}
        onClear={() => updateCriteria({ query: '', sort: 'lastAppliedAt', status: 'all' })}
        onCriteriaChange={updateCriteria}
        statusLabels={applicationContent.statusLabels}
        translations={content.filters}
      />
      <section className="recruiter-candidates-results">
        <header>
          <p>{content.results.countLabel.replace('{{count}}', String(meta.total))}</p>
        </header>
        {candidates.length ? (
          <div className="recruiter-candidates-table">
            <div className="recruiter-candidates-list-header" role="row">
              <span>{applicationContent.results.columns.candidate}</span>
              <span>{content.results.latestJob}</span>
              <span>{content.filters.statusLabel}</span>
              <span>{content.results.bestMatch}</span>
              <span>{content.results.lastApplied}</span>
              <span>{applicationContent.results.columns.actions}</span>
            </div>
            <div className="recruiter-candidates-list">
              {candidates.map((candidate) => (
                <CandidateCard
                  candidate={candidate}
                  key={candidate.candidateId}
                  locale={locale}
                  matchLevelLabels={applicationContent.match.levels}
                  onOpen={(candidateId) => void openCandidate(candidateId)}
                  statusLabels={applicationContent.statusLabels}
                  translations={content}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="recruiter-candidates-empty">
            <h2>{content.results.emptyTitle}</h2>
            <p>{content.results.emptyDescription}</p>
          </div>
        )}
      </section>
      <AdminPagination
        labels={applicationContent.pagination}
        onPageChange={(page) => setMeta((current) => ({ ...current, page }))}
        page={meta.page}
        totalPages={meta.totalPages}
      />
      {selectedCandidate ? (
        <CandidateDrawer
          candidate={selectedCandidate}
          locale={locale}
          matchLevelLabels={applicationContent.match.levels}
          onClose={() => setSelectedCandidate(null)}
          statusLabels={applicationContent.statusLabels}
          translations={content}
        />
      ) : null}
    </div>
  )
}

export default RecruiterCandidatesPage
