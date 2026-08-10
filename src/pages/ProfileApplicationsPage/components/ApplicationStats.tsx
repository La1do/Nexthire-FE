import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationStatsValue } from '../types'

type ApplicationStatsProps = {
  labels: ProfileTranslations['applications']['stats']
  stats: ApplicationStatsValue
}

export function ApplicationStats({ labels, stats }: ApplicationStatsProps) {
  const items = [
    { key: 'total', label: labels.total, value: stats.total },
    { key: 'active', label: labels.active, value: stats.active },
    { key: 'interviews', label: labels.interviews, value: stats.interviews },
    { key: 'closed', label: labels.closed, value: stats.closed },
  ]

  return (
    <section className="profile-application-stats" aria-label={labels.total}>
      {items.map((item) => (
        <div key={item.key}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  )
}
