import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  AdminUserGrowthPeriod,
  AdminUserGrowthPoint,
} from '../../../types/admin.types'

type DashboardGrowthChartProps = {
  badgeLabel: string
  comparisonLabel: string
  data: AdminUserGrowthPoint[]
  description: string
  growthLoading: boolean
  growthPercent?: number | null
  newUsersLabel: string
  onPeriodChange: (period: AdminUserGrowthPeriod) => void
  period: AdminUserGrowthPeriod
  periodLabels: Record<AdminUserGrowthPeriod, string>
  title: string
  totalUsersLabel: string
  unavailableLabel: string
}

const periods: AdminUserGrowthPeriod[] = ['7d', '30d', '90d']

export function DashboardGrowthChart({
  badgeLabel,
  comparisonLabel,
  data,
  description,
  growthLoading,
  growthPercent,
  newUsersLabel,
  onPeriodChange,
  period,
  periodLabels,
  title,
  totalUsersLabel,
  unavailableLabel,
}: DashboardGrowthChartProps) {
  const growthTone =
    growthPercent === null || growthPercent === 0
      ? 'neutral'
      : growthPercent && growthPercent > 0
        ? 'positive'
        : 'negative'
  const formattedGrowth =
    growthPercent === null
      ? unavailableLabel
      : growthPercent === undefined
        ? null
        : `${growthPercent > 0 ? '+' : ''}${new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 2,
          }).format(growthPercent)}%`

  return (
    <section className="admin-dashboard-panel admin-dashboard-growth">
      <header className="admin-dashboard-growth__header">
        <div>
          <span className="admin-dashboard-growth__badge">{badgeLabel}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="admin-dashboard-growth__actions">
          {growthLoading ? (
            <span
              aria-label={comparisonLabel}
              className="admin-dashboard-growth__metric-skeleton"
            />
          ) : formattedGrowth ? (
            <div className={`admin-dashboard-growth__metric is-${growthTone}`}>
              <strong>{formattedGrowth}</strong>
              {growthPercent !== null ? <span>{comparisonLabel}</span> : null}
            </div>
          ) : null}
          <div aria-label={title} className="admin-dashboard-periods">
            {periods.map((item) => (
              <button
                className={item === period ? 'is-active' : undefined}
                key={item}
                onClick={() => onPeriodChange(item)}
                type="button"
              >
                {periodLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div aria-label={title} className="admin-dashboard-growth__canvas" role="img">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
            <defs>
              <linearGradient id="dashboardTotalUsers" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-solid)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-brand-solid)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="date" tickLine={false} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={36} />
            <Tooltip />
            <Legend />
            <Area
              dataKey="totalUsers"
              fill="url(#dashboardTotalUsers)"
              name={totalUsersLabel}
              stroke="var(--color-brand-solid)"
              strokeWidth={3}
              type="monotone"
            />
            <Area
              dataKey="newUsers"
              fill="transparent"
              name={newUsersLabel}
              stroke="var(--color-home-salary-blue-text)"
              strokeDasharray="5 4"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
