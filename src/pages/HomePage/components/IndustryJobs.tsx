import type { HomeTranslations } from '../../../i18n/types'
import type { IndustryGroupView } from '../types'
import { HomeSectionState } from './HomeSectionState'
import { JobCard } from './JobCard'
import { SectionHeading } from './SectionHeading'

type IndustryJobsProps = {
  content: HomeTranslations['industryJobs']
  states: HomeTranslations['states']
  groups: ReadonlyArray<IndustryGroupView>
  loading: boolean
  error: unknown
}

export function IndustryJobs({ content, states, groups, loading, error }: IndustryJobsProps) {
  const isEmpty = !groups.length
  const showPlaceholder = loading || Boolean(error) || isEmpty

  return (
    <section className="home-section home-industry-section" data-home-reveal>
      <SectionHeading action={content.viewAll} title={content.title} />

      {showPlaceholder ? (
        <HomeSectionState error={error} isEmpty={isEmpty} loading={loading} states={states} />
      ) : (
        <div className="home-industry-list">
          {groups.map((group) => (
            <section className="home-industry-group" key={group.categoryId ?? group.title}>
              <div className="home-industry-heading">
                <h3>{group.title}</h3>
                <a href={group.categoryId ? `/search?categoryId=${group.categoryId}` : '/search'}>
                  {content.viewMore}
                </a>
              </div>
              <div className="home-card-grid">
                {group.jobs.map((job) => (
                  <JobCard
                    job={job}
                    key={job.id}
                    saveLabel={content.saveLabel}
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
