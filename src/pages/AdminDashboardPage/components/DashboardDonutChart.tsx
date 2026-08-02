import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { DashboardChartItem } from './DashboardDistributionChart'

type DashboardDonutChartProps = {
  data: DashboardChartItem[]
  emptyLabel: string
  title: string
}

const chartColors = [
  "#F25555",
  "#F23B94", 
  "#8B5CF6", 
  "#2C6CA3", 
  "#19A974", 
  "#F2B84B", 
];

export function DashboardDonutChart({
  data,
  emptyLabel,
  title,
}: DashboardDonutChartProps) {
  const visibleData = data.filter((item) => item.value > 0)
  const total = visibleData.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="admin-dashboard-panel admin-dashboard-donut">
      <header className="admin-dashboard-panel__header">
        <h2>{title}</h2>
      </header>
      {visibleData.length > 0 ? (
        <div className="admin-dashboard-donut__body">
          <div aria-label={title} className="admin-dashboard-donut__canvas" role="img">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  dataKey="value"
                  innerRadius="62%"
                  nameKey="label"
                  outerRadius="88%"
                  paddingAngle={3}
                >
                  {visibleData.map((item, index) => (
                    <Cell
                      fill={chartColors[index % chartColors.length]}
                      key={item.label}
                      stroke="var(--color-surface-card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <strong>{total}</strong>
          </div>
          <ul className="admin-dashboard-donut__legend">
            {visibleData.map((item, index) => (
              <li key={item.label}>
                <span
                  aria-hidden="true"
                  style={{ background: chartColors[index % chartColors.length] }}
                />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="admin-dashboard-chart__empty">{emptyLabel}</p>
      )}
    </section>
  )
}

