import type { JobDetailTranslations } from '../../../types'

export const jobDetail: JobDetailTranslations = {
  routeLabel: 'Job detail',
  backToSearch: 'Back to search results',
  states: {
    loading: 'Loading job...',
    errorTitle: 'Could not load job',
    errorDescription: 'Something went wrong while loading this posting. Please try again.',
  },
  hero: {
    metaLabel: 'Main job information',
    verifiedLabel: 'Verified company',
  },
  sidebar: {
    title: 'Hiring snapshot',
    salary: 'Salary',
    location: 'Location',
    workMode: 'Work mode',
    postedAt: 'Posted',
    deadline: 'Application deadline',
    noDeadline: 'No deadline',
    openings: 'Openings',
    apply: 'Apply now',
    save: 'Save job',
  },
  sections: {
    description: 'Job description',
    requirements: 'Requirements',
    benefits: 'Benefits',
  },
  related: {
    title: 'Related roles',
    viewAll: 'See more in search',
    viewDetail: 'View details',
  },
  notFound: {
    title: 'Job not found',
    description: 'This role may be closed or the link may be incorrect.',
    action: 'Back to job search',
  },
}
