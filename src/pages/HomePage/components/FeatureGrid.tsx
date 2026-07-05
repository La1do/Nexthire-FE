const features = [
  {
    title: 'Page-first structure',
    description: 'Moi page nam trong mot folder rieng, de them component cuc bo ma khong lam roi src.',
  },
  {
    title: 'Shared page UI',
    description: 'Nhung component dung lai giua cac page duoc dat trong pages/_components.',
  },
  {
    title: 'Reusable layouts',
    description: 'Layout duoc tach rieng trong src/layouts de dung cho app shell va auth flow.',
  },
]

export function FeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <article className="rounded-lg border border-[#dedfd7] bg-white p-5 shadow-sm" key={feature.title}>
          <h2 className="text-lg font-semibold text-[#20242c]">{feature.title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#5f6673]">{feature.description}</p>
        </article>
      ))}
    </section>
  )
}
