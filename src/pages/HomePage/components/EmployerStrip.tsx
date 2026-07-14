import type { HomeTranslations } from '../../../i18n/types'
import { SectionHeading } from './SectionHeading'

type EmployerStripProps = {
  content: HomeTranslations['employers']
}

export function EmployerStrip({ content }: EmployerStripProps) {
  return (
    <section className="home-section home-reveal">
      <SectionHeading action={content.viewAll} eyebrow={content.eyebrow} title={content.title} />
      <div className="home-employer-strip">
        {content.items.map((item) => (
          <article className="home-employer-card home-hover-card" key={item}>
            {item}
          </article>
        ))}
      </div>
    </section>
  )
}
