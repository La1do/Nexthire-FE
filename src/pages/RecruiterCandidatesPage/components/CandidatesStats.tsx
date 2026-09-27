import type { RecruiterCandidatesTranslations } from '../../../i18n/types'
import { AdminStatCard } from '../../_components/admin/AdminStatCard'
import type { CandidateRow } from '../types'
import { CandidateIcon } from './CandidateIcon'

const STRONG_MATCH_SCORE = 70

type CandidatesStatsProps = {
  candidates: ReadonlyArray<CandidateRow>
  total: number
  translations: RecruiterCandidatesTranslations['stats']
}

export function CandidatesStats({ candidates, total, translations }: CandidatesStatsProps) {
  const applications = candidates.reduce((sum, candidate) => sum + candidate.applicationCount, 0)
  const strongMatches = candidates.filter((candidate) => (candidate.bestMatchScore ?? 0) >= STRONG_MATCH_SCORE).length

  return (
    <section className="recruiter-candidates-stats">
      <AdminStatCard icon={<CandidateIcon />} label={translations.candidates} tone="blue" value={total} />
      <AdminStatCard icon={<CandidateIcon />} label={translations.applications} tone="coral" value={applications} />
      <AdminStatCard icon={<CandidateIcon />} label={translations.strongMatches} tone="violet" value={strongMatches} />
    </section>
  )
}
