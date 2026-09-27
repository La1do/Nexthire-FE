import type { RecruiterCandidatesTranslations } from '../../../i18n/types'
import type { CandidateMatchLevelLabels, CandidateRow, CandidateStatusLabels } from '../types'
import { formatDate } from '../utils/candidateFormat'
import { CandidateAvatar } from './CandidateAvatar'
import { CandidateJobChips } from './CandidateJobChips'
import { CandidateMatchBadge } from './CandidateMatchBadge'
import { CandidateStatusBadge } from './CandidateStatusBadge'

type CandidateCardProps = {
  candidate: CandidateRow
  locale: string
  matchLevelLabels: CandidateMatchLevelLabels
  onOpen: (candidateId: string) => void
  statusLabels: CandidateStatusLabels
  translations: RecruiterCandidatesTranslations
}

/** One row per candidate with every in-scope JD they applied to. */
export function CandidateCard({ candidate, locale, matchLevelLabels, onOpen, statusLabels, translations }: CandidateCardProps) {
  const skillPreview = candidate.skills.slice(0, 4)

  return (
    <article className="recruiter-candidate-card">
      <button
        aria-label={`${translations.results.viewProfile}: ${candidate.fullName}`}
        className="recruiter-candidate-card__main"
        onClick={() => onOpen(candidate.candidateId)}
        type="button"
      >
        <CandidateAvatar avatarUrl={candidate.avatarUrl} name={candidate.fullName} />
        <span>
          <strong>{candidate.fullName}</strong>
          <small>{candidate.headline || candidate.email}</small>
          {skillPreview.length ? (
            <span className="recruiter-candidate-card__skills">
              {skillPreview.map((skill) => <span key={skill.name}>{skill.name}</span>)}
            </span>
          ) : null}
        </span>
      </button>
      <CandidateJobChips
        jobs={candidate.applications}
        label={translations.results.appliedJobs}
        openLabel={translations.results.openJobApplications}
      />
      <CandidateStatusBadge labels={statusLabels} status={candidate.latestStatus} />
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
