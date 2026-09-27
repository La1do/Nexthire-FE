import type { RecruiterCandidatesTranslations } from '../../../i18n/types'
import { Button, SelectField } from '../../_components'
import type { CandidateCriteria, CandidateSort, CandidateStatusFilter, CandidateStatusLabels } from '../types'
import { CANDIDATE_STATUS_ORDER } from '../utils/candidateCriteria'

type CandidateFiltersProps = {
  criteria: CandidateCriteria
  onClear: () => void
  onCriteriaChange: (criteria: CandidateCriteria) => void
  statusLabels: CandidateStatusLabels
  translations: RecruiterCandidatesTranslations['filters']
}

export function CandidateFilters({ criteria, onClear, onCriteriaChange, statusLabels, translations }: CandidateFiltersProps) {
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
        onChange={(value) => onCriteriaChange({ ...criteria, status: value as CandidateStatusFilter })}
        options={[
          { label: translations.allStatuses, value: 'all' },
          ...CANDIDATE_STATUS_ORDER.map((status) => ({ label: statusLabels[status], value: status })),
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
