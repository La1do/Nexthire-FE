import type { RecruiterCandidatesTranslations } from '../../../i18n/types'
import type { CandidateMatchLevelLabels, CandidateRow, CandidateStatusLabels } from '../types'
import { CandidateCard } from './CandidateCard'

type CandidateListProps = {
  candidates: ReadonlyArray<CandidateRow>
  locale: string
  matchLevelLabels: CandidateMatchLevelLabels
  onOpen: (candidateId: string) => void
  statusLabels: CandidateStatusLabels
  translations: RecruiterCandidatesTranslations
}

export function CandidateList({ candidates, locale, matchLevelLabels, onOpen, statusLabels, translations }: CandidateListProps) {
  return (
    <div className="recruiter-candidates-table">
      <div className="recruiter-candidates-list-header" role="row">
        <span>{translations.results.candidate}</span>
        <span>{translations.results.appliedJobs}</span>
        <span>{translations.filters.statusLabel}</span>
        <span>{translations.results.bestMatch}</span>
        <span>{translations.results.lastApplied}</span>
        <span>{translations.results.actions}</span>
      </div>
      <div className="recruiter-candidates-list">
        {candidates.map((candidate) => (
          <CandidateCard
            candidate={candidate}
            key={candidate.candidateId}
            locale={locale}
            matchLevelLabels={matchLevelLabels}
            onOpen={onOpen}
            statusLabels={statusLabels}
            translations={translations}
          />
        ))}
      </div>
    </div>
  )
}
