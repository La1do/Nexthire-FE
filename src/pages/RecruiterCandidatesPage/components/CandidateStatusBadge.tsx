import type { ApplicationStatus } from '../../../types/application.types'
import type { CandidateStatusLabels } from '../types'
import { getCandidateStatusBadgeClassName } from '../utils/candidateStatusBadge'

type CandidateStatusBadgeProps = {
  labels: CandidateStatusLabels
  status: ApplicationStatus
}

export function CandidateStatusBadge({ labels, status }: CandidateStatusBadgeProps) {
  return <span className={getCandidateStatusBadgeClassName(status)}>{labels[status]}</span>
}
