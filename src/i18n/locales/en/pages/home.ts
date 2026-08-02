import type { HomeTranslations } from '../../../types'

export const home: HomeTranslations = {
  states: {
    loading: 'Loading roles…',
    errorTitle: 'Could not load this section',
    errorDescription: 'Please refresh the page or try again in a moment.',
    emptyTitle: 'Nothing here yet',
    emptyDescription: 'No matching results are available right now.',
  },
  hero: {
    eyebrow: 'Career opportunities',
    title: 'Find work that matches your next move',
    description: 'Explore verified roles from trusted companies and filter quickly by location, salary, and work style.',
    keywordLabel: 'Job keyword',
    keywordPlaceholder: 'Role, skill, or company',
    locationLabel: 'Location',
    locationPlaceholder: 'All locations',
    locationOptions: ['Ha Noi', 'Ho Chi Minh City', 'Da Nang', 'Remote'],
    filterLabel: 'Open filters',
    submit: 'Search',
    quickFilters: ['Remote', 'Hybrid', 'Senior', '25M+ salary'],
    stats: {
      openRoles: 'open roles',
      companies: 'verified companies',
      categories: 'career tracks',
    },
    spotlight: {
      title: 'Hiring this week',
      subtitle: 'Companies with active roles matching strong candidate demand',
    },
  },
  employers: {
    eyebrow: 'Hiring partners',
    title: 'Employers gaining momentum',
    viewAll: 'View all',
  },
  jobs: {
    eyebrow: 'Job list',
    title: 'Recommended roles today',
    tabs: ['Recommended', 'Newest', 'High salary'],
    loadMore: 'Load more roles',
    saveLabel: 'Save job',
  },
  categories: {
    eyebrow: 'Quick discovery',
    title: 'Filter by career track',
  },
  industryJobs: {
    eyebrow: 'By industry',
    title: 'Opportunities by industry',
    viewAll: 'View all industries',
    viewMore: 'View more',
    saveLabel: 'Save job',
  },
  articles: {
    title: 'Career guides',
    readMore: 'Read more',
    items: [
      {
        category: 'Interview',
        description: 'Prepare answers, reverse questions, and follow-up notes before your next interview.',
        title: 'How to stand out in your next interview',
        tone: 'coral',
      },
      {
        category: 'CV',
        description: 'Frame achievements, skills, and projects so recruiters can read your profile faster.',
        title: 'Build a stronger CV in 30 minutes',
        tone: 'blue',
      },
      {
        category: 'Growth',
        description: 'Spot the right moment to move roles, negotiate salary, and plan your next learning cycle.',
        title: 'Sustainable career growth strategies',
        tone: 'green',
      },
    ],
  },
  newsletter: {
    eyebrow: 'New job alerts',
    title: 'Set up alerts around your real target',
    description: 'Get weekly emails with new roles, salary insights, and practical career content.',
    emailLabel: 'Notification email',
    emailPlaceholder: 'Your email',
    emailHelper: 'One email a week. Unsubscribe at any time.',
    submit: 'Subscribe',
    chips: ['Engineering', 'Remote', '25M+', 'Senior'],
    mockTitle: 'Matched brief',
    mockLines: ['4 new roles from verified companies', '2 remote roles in your salary range', 'Interview checklist for this week'],
  },
}
