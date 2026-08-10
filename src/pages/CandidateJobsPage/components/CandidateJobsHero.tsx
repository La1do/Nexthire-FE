import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateManagedJobsStats } from '../types'

type CandidateJobsHeroProps = {
  content: ProfileTranslations['managedJobs']
  stats: CandidateManagedJobsStats
}

export function CandidateJobsHero({ content, stats }: CandidateJobsHeroProps) {
  const statItems = [
    { label: content.stats.saved, value: stats.saved },
    { label: content.stats.applied, value: stats.applied },
    { label: content.stats.active, value: stats.active },
    { label: content.stats.needsAttention, value: stats.needsAttention },
  ]

  return (
    <section className="candidate-jobs-hero">
      <div className="candidate-jobs-hero-copy">
        <span>{content.routeLabel}</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>

      <div aria-label={content.stats.label} className="candidate-jobs-stats">
        {statItems.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
