import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export type DashboardChartItem = {
  label: string
  value: number
}

type DashboardDistributionChartProps = {
  data: DashboardChartItem[]
  emptyLabel: string
  title: string
}

export function DashboardDistributionChart({
  data,
  emptyLabel,
  title,
}: DashboardDistributionChartProps) {
  const hasData = data.some((item) => item.value > 0)

  return (
    <section className="admin-dashboard-panel admin-dashboard-chart">
      <header className="admin-dashboard-panel__header">
        <h2>{title}</h2>
      </header>
      <div className="admin-dashboard-chart__body">
        {hasData ? (
          <div
            aria-label={title}
            className="admin-dashboard-chart__canvas"
            role="img"
          >
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 20 }}>
                <CartesianGrid horizontal={false} stroke="var(--color-border-subtle)" />
                <XAxis allowDecimals={false} type="number" />
                <YAxis dataKey="label" type="category" width={112} />
                <Tooltip cursor={{ fill: 'var(--color-surface-muted)' }} />
                <Bar dataKey="value" fill="var(--color-brand-solid)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="admin-dashboard-chart__empty">{emptyLabel}</p>
        )}
      </div>
    </section>
  )
}
