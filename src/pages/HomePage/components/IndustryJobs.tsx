import type { HomeTranslations } from '../../../i18n/types'
import { JobCard } from './JobCard'
import { SectionHeading } from './SectionHeading'

type IndustryJobsProps = {
  content: HomeTranslations['industryJobs']
}

export function IndustryJobs({ content }: IndustryJobsProps) {
  return (
    <section className="home-section home-reveal">
      <SectionHeading action={content.viewAll} eyebrow={content.eyebrow} title={content.title} />
      <div className="home-industry-list">
        {content.groups.map((group) => (
          <section className="home-industry-group" key={group.title}>
            <div className="home-industry-heading">
              <h3>{group.title}</h3>
              <a href="/">
                {content.viewMore}
              </a>
            </div>
            <div className="home-card-grid">
              {group.jobs.map((job) => (
                <JobCard
                  job={job}
                  key={`${group.title}-${job.company}-${job.title}`}
                  saveLabel={content.saveLabel}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
