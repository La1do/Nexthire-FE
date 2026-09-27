import { Link } from 'react-router-dom'
import type { RecruiterCandidatesTranslations } from '../../../i18n/types'
import { Button } from '../../_components'
import { useCandidateDetail } from '../hooks/useCandidateDetail'
import type { CandidateMatchLevelLabels, CandidateRow, CandidateStatusLabels } from '../types'
import { isForbiddenError } from '../utils/candidateErrors'
import { formatDate, formatMatch } from '../utils/candidateFormat'
import { getJobApplicationHref } from '../utils/candidateRoutes'
import { CandidateAvatar } from './CandidateAvatar'
import { CandidateStatusBadge } from './CandidateStatusBadge'

type CandidateDrawerProps = {
  candidateId: string
  locale: string
  matchLevelLabels: CandidateMatchLevelLabels
  onClose: () => void
  statusLabels: CandidateStatusLabels
  translations: RecruiterCandidatesTranslations
}

function CandidateDrawerBody({
  candidate,
  locale,
  matchLevelLabels,
  statusLabels,
  translations,
}: Omit<CandidateDrawerProps, 'candidateId' | 'onClose'> & { candidate: CandidateRow }) {
  const { detail, results } = translations

  return (
    <>
      <dl className="recruiter-candidate-drawer__summary">
        <div>
          <dt>{detail.applications}</dt>
          <dd>{candidate.applications.length}</dd>
        </div>
        <div>
          <dt>{results.bestMatch}</dt>
          <dd>{formatMatch(candidate.bestMatchScore, candidate.bestMatchLevel, detail.noData, matchLevelLabels)}</dd>
        </div>
        <div>
          <dt>{results.lastApplied}</dt>
          <dd>{formatDate(candidate.lastAppliedAt, locale, detail.noData)}</dd>
        </div>
      </dl>
      <section>
        <h3>{detail.contact}</h3>
        <dl className="recruiter-candidate-drawer__facts">
          <div><dt>{detail.email}</dt><dd>{candidate.email}</dd></div>
          <div><dt>{detail.phone}</dt><dd>{candidate.phone || detail.noData}</dd></div>
          <div><dt>{detail.location}</dt><dd>{candidate.location || detail.noData}</dd></div>
        </dl>
      </section>
      <section>
        <h3>{detail.skills}</h3>
        <div className="recruiter-candidate-drawer__skills">
          {candidate.skills.length ? candidate.skills.map((skill) => (
            <span key={`${skill.name}-${skill.level ?? 'level'}`}>
              {skill.name}{skill.level ? ` · ${skill.level}` : ''}
            </span>
          )) : <p>{detail.noSkills}</p>}
        </div>
      </section>
      <section>
        <h3>{detail.applications}</h3>
        <div className="recruiter-candidate-history">
          {candidate.applications.map((application) => (
            <Link key={application.id} to={getJobApplicationHref(application.jobId, application.id)}>
              <span>
                <strong>{application.jobTitle}</strong>
                <small>{formatDate(application.submittedAt, locale, detail.noData)}</small>
              </span>
              <CandidateStatusBadge labels={statusLabels} status={application.status} />
              <b>{formatMatch(application.matchScore, application.matchLevel, detail.noData, matchLevelLabels)}</b>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

/** Candidate profile with the in-scope JD history (data scoped by the service). */
export function CandidateDrawer({ candidateId, onClose, translations, ...bodyProps }: CandidateDrawerProps) {
  const detailQuery = useCandidateDetail(candidateId)
  const candidate = detailQuery.data
  const { detail, states } = translations

  function renderContent() {
    if (detailQuery.isPending) {
      return <p role="status">{detail.loading}</p>
    }

    if (detailQuery.isError || !candidate) {
      const forbidden = isForbiddenError(detailQuery.error)
      return (
        <div role="alert">
          <p>{forbidden ? states.forbiddenDescription : states.detailError}</p>
          {forbidden ? null : (
            <Button onClick={() => void detailQuery.refetch()} type="button" variant="secondary">
              {states.retry}
            </Button>
          )}
        </div>
      )
    }

    return <CandidateDrawerBody candidate={candidate} translations={translations} {...bodyProps} />
  }

  return (
    <div className="recruiter-candidate-drawer" role="dialog" aria-modal="true" aria-label={detail.title}>
      <button aria-label={detail.close} className="recruiter-candidate-drawer__backdrop" onClick={onClose} type="button" />
      <aside className="recruiter-candidate-drawer__panel">
        <header>
          <div className="recruiter-candidate-drawer__identity">
            {candidate ? <CandidateAvatar avatarUrl={candidate.avatarUrl} large name={candidate.fullName} /> : null}
            <div>
              <p>{detail.title}</p>
              {candidate ? (
                <>
                  <h2>{candidate.fullName}</h2>
                  <span>{candidate.headline || candidate.email}</span>
                </>
              ) : null}
            </div>
          </div>
          <button aria-label={detail.close} onClick={onClose} type="button">×</button>
        </header>
        {renderContent()}
      </aside>
    </div>
  )
}
