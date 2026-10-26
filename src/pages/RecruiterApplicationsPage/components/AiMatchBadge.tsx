import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'

type AiMatchBadgeProps = {
  application: Pick<RecruiterApplicationItem, 'cvParseStatus'>
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

  return (
    <span className="recruiter-ai-match-badge recruiter-ai-match-badge--empty">
      {labels.cvParseStatus[application.cvParseStatus]}
    </span>
  )
}
