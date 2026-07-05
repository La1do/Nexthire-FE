const metrics = [
  { label: 'Ung vien mau', value: '1.2k' },
  { label: 'Tin dang mau', value: '320' },
  { label: 'Thoi gian setup', value: 'Ready' },
]

export function MetricsRow() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <article className="rounded-lg border border-[#dedfd7] bg-white p-5 shadow-sm" key={metric.label}>
          <p className="text-sm text-[#5f6673]">{metric.label}</p>
          <strong className="mt-2 block text-3xl text-[#20242c]">{metric.value}</strong>
        </article>
      ))}
    </section>
  )
}
