import type { JobDetailTranslations } from '../../../types'

export const jobDetail: JobDetailTranslations = {
  routeLabel: 'Job detail',
  backToSearch: 'Back to search results',
  hero: {
    metaLabel: 'Main job information',
    verifiedLabel: 'Verified company',
  },
  sidebar: {
    title: 'Hiring snapshot',
    salary: 'Salary',
    location: 'Location',
    workMode: 'Work mode',
    field: 'Career track',
    postedAt: 'Posted',
    apply: 'Apply now',
    save: 'Save job',
  },
  sections: {
    overview: {
      title: 'Role overview',
      body: '{{company}} is hiring for {{title}} in {{field}}. This role suits candidates who want {{workMode}} work in {{location}} and care about shipping useful product improvements.',
    },
    responsibilities: {
      title: 'What you will own',
      items: [
        'Build and improve core workstreams connected to {{tags}}.',
        'Partner with product teams to turn hiring needs into clear user experiences.',
        'Track delivery quality, capture feedback, and refine the workflow after each release cycle.',
      ],
    },
    requirements: {
      title: 'Good fit profile',
      items: [
        'Hands-on experience with {{tags}} or comparable skills in {{field}}.',
        'Clear communication while working in a {{workMode}} setup.',
        'Strong problem analysis, practical proposals, and reliable delivery rhythm.',
      ],
    },
    benefits: {
      title: 'Highlights',
      items: [
        'Reference salary range of {{salary}} with a transparent interview process.',
        '{{workMode}} environment in {{location}} with a team used to modern product delivery.',
        'NexHire profiles are structured to help employers respond faster.',
      ],
    },
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
