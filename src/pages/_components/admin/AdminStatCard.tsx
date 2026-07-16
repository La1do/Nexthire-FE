import type { ReactNode } from 'react'

type AdminStatTone = 'blue' | 'coral' | 'violet' | 'amber'

type AdminStatCardProps = {
  label: string
  value: number | string
  delta?: string
  tone: AdminStatTone
  icon: ReactNode
}

export function AdminStatCard({ label, value, delta, tone, icon }: AdminStatCardProps) {
  return (
    <article className={`admin-stat-card admin-stat-card--${tone}`}>
      <div className="admin-stat-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="admin-stat-card__body">
        <p className="admin-stat-card__label">{label}</p>
        <p className="admin-stat-card__value">{value}</p>
        {delta ? <p className="admin-stat-card__delta">{delta}</p> : null}
      </div>
    </article>
  )
}
