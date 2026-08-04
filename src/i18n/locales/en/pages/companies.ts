import type { CompaniesTranslations } from '../../../types'

export const companies: CompaniesTranslations = {
  routeLabel: 'Companies',
  hero: {
    title: 'Explore hiring companies',
    description:
      'Follow verified employers, scan open roles, and choose the workplace fit before you apply.',
    searchLabel: 'Search companies',
    searchPlaceholder: 'Company, role, or skill',
    locationLabel: 'Location',
    locationAll: 'All locations',
    workModeLabel: 'Work style',
    workModeAll: 'All work styles',
    reset: 'Clear filters',
  },
  stats: {
    companies: 'hiring companies',
    openRoles: 'open roles',
    remoteFriendly: 'remote-friendly companies',
  },
  sort: {
    mostJobs: 'Most roles',
    latest: 'Recently hiring',
    name: 'Name A-Z',
  },
  sections: {
    directoryTitle: 'Company directory',
    directoryDescription: 'Filter quickly by company, location, and work style.',
    latestJobsTitle: 'Fresh role highlights',
    latestJobsDescription: 'A few of the newest roles from companies in this list.',
  },
  card: {
    verified: 'Verified',
    openRoles: 'open roles',
    latestHiring: 'Latest activity',
    locations: 'Locations',
    workModes: 'Work styles',
    rolesPreview: 'New roles',
    noLocation: 'Not updated',
    noJobs: 'No visible roles yet',
  },
  actions: {
    viewCompany: 'View profile',
    viewJobs: 'View jobs',
    retry: 'Try again',
  },
  states: {
    loading: 'Loading companies...',
    errorTitle: 'Could not load companies',
    errorDescription: 'Please try again in a moment.',
    emptyTitle: 'No matching companies',
    emptyDescription: 'Try another keyword, location, or work style.',
  },
}
