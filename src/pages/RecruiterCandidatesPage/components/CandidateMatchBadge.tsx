import type { ApplicationMatchLevel } from '../../../types/application.types'
import type { CandidateMatchLevelLabels } from '../types'

type CandidateMatchBadgeProps = {
  fallback: string
  level: ApplicationMatchLevel | null
  levelLabels: CandidateMatchLevelLabels
  score: number | null
}

export function CandidateMatchBadge({ fallback, level, levelLabels, score }: CandidateMatchBadgeProps) {
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
