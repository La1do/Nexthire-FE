import type { SearchTranslations } from '../../../types'

export const search: SearchTranslations = {
  routeLabel: 'Job search',
  toolbar: {
    title: 'Find roles around your criteria',
    description: 'Refine keyword, location, and filters to see the most relevant open roles.',
    keywordLabel: 'Keyword',
    keywordPlaceholder: 'Role, skill, or company',
    locationLabel: 'Location',
    locationPlaceholder: 'All locations',
    submit: 'Update search',
  },
  filters: {
    title: 'Filters',
    description: 'Keep the filter set focused so scanning results stays fast.',
    fieldLabel: 'Career track',
    locationLabel: 'Location',
    salaryLabel: 'Minimum salary',
    workModeLabel: 'Work mode',
    allOption: 'All',
    clear: 'Clear filters',
    apply: 'Apply',
    fieldOptions: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Design', value: 'Design' },
      { label: 'Business', value: 'Business' },
    ],
    salaryOptions: [
      { label: 'From 15M', value: '15' },
      { label: 'From 20M', value: '20' },
      { label: 'From 25M', value: '25' },
      { label: 'From 35M', value: '35' },
    ],
    workModeOptions: [
      { label: 'Remote', value: 'Remote' },
      { label: 'Hybrid', value: 'Hybrid' },
      { label: 'On-site', value: 'On-site' },
    ],
  },
  results: {
    title: 'Matched results',
    countLabel: '{{count}} jobs found',
    emptyQuery: 'All open roles',
    sortLabel: 'Sort',
    sortOptions: [
      { label: 'Best match', value: 'relevance' },
      { label: 'Newest', value: 'newest' },
      { label: 'Highest salary', value: 'salary' },
    ],
    saveLabel: 'Save job',
    verifiedLabel: 'Verified',
    detailLabel: 'View details',
    activeFiltersLabel: 'Active filters',
  },
  empty: {
    title: 'No matching roles yet',
    description: 'Try a shorter keyword or remove a few filters to widen the result set.',
    action: 'View all jobs',
  },
}
