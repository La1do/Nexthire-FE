import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'

type AiMatchBadgeProps = {
  application: Pick<RecruiterApplicationItem, 'cvParseStatus' | 'matchLevel' | 'matchScore'>
  labels: RecruiterApplicationsTranslations['match']
}

export function AiMatchBadge({ application, labels }: AiMatchBadgeProps) {
  if (application.cvParseStatus === 'PARSING') {
    return (
      <span className="recruiter-ai-match-badge recruiter-ai-match-badge--loading">
        {labels.processing}
      </span>
    )
  }

  if (application.cvParseStatus === 'FAILED') {
    return (
      <span className="recruiter-ai-match-badge recruiter-ai-match-badge--failed">
        {labels.cvFailed}
      </span>
    )
  }

  if (application.matchScore === null) {
    return (
      <span className="recruiter-ai-match-badge recruiter-ai-match-badge--empty">
        {labels.notScored}
      </span>
    )
  }

  const levelClassName = application.matchLevel?.toLowerCase() ?? 'scored'
  const levelLabel = application.matchLevel ? labels.levels[application.matchLevel] : labels.scored

  return (
    <span className={`recruiter-ai-match-badge recruiter-ai-match-badge--${levelClassName}`}>
      <strong>{application.matchScore}%</strong>
      <span>{levelLabel}</span>
    </span>
  )
}
