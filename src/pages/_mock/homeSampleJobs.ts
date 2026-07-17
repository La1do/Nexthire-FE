import type { HomeCompanyItem, HomeJobItem } from '../../i18n/types'
import { createCompanySlug, createJobSlug } from '../_utils/jobRoutes'
import type { JobCardView } from '../HomePage/types'

// Canonical sample data for pages that are not yet wired to the API
// (JobDetail, Search, CompanyDetail). Home no longer reads these — it uses
// the live public job/category endpoints. This mock is English-only on
// purpose; the consuming pages are pending their own API integration.

// Bridge the legacy HomeJobItem (used by JobDetail, Search, CompanyDetail)
// to the JobCardView expected by the shared JobCard component.
export function adaptHomeJobItemToCardView(
  job: HomeJobItem,
  badgeTone: 'blue' | 'pink' = 'blue',
): JobCardView {
  const salaryNumbers = job.salary.match(/\d+/g)?.map(Number) ?? []
  const salarySortValue = salaryNumbers.length ? Math.max(...salaryNumbers) : 0

  const dayMatch = job.postedAt.match(/(\d+)/)
  const postedSortValue = dayMatch ? Date.now() - Number(dayMatch[1]) * 86_400_000 : 0

  return {
    id: createJobSlug(job),
    companyId: createCompanySlug(job.company),
    company: job.company,
    title: job.title,
    location: job.location,
    workMode: job.workMode,
    workingType: 'ONSITE',
    salary: job.salary,
    salarySortValue,
    postedAt: job.postedAt,
    postedSortValue,
    tags: job.tags,
    categoryId: null,
    verified: job.verified ?? false,
    badgeTone,
    logo: {
      alt: job.companyLogo.alt,
      fallbackText: job.companyLogo.fallbackText,
      src: job.companyLogo.src,
      tone: job.companyLogo.tone,
    },
  }
}


export const homeSampleJobs: ReadonlyArray<HomeJobItem> = [
  {
    badgeTone: 'blue',
    company: 'NexHire Tech',
    companyLogo: {
      alt: 'NexHire Tech logo',
      fallbackText: 'NH',
      src: '/company-logos/nexhire-tech.svg',
      tone: 'blue',
    },
    description: 'Build a modern hiring experience that improves application speed and candidate profile management.',
    field: 'Engineering',
    location: 'Ha Noi',
    postedAt: 'Posted 2 hours ago',
    salary: '25-35M VND',
    tags: ['React', 'TypeScript', 'Senior'],
    title: 'Senior Frontend Engineer',
    verified: true,
    workMode: 'Hybrid',
  },
  {
    badgeTone: 'pink',
    company: 'Cloudify VN',
    companyLogo: {
      alt: 'Cloudify VN logo',
      fallbackText: 'CL',
      src: '/company-logos/cloudify-vn.svg',
      tone: 'violet',
    },
    description: 'Develop backend services for booking, notification, and API integrations on cloud infrastructure.',
    field: 'Engineering',
    location: 'Ho Chi Minh City',
    postedAt: 'Posted today',
    salary: '20-30M VND',
    tags: ['Node.js', 'AWS', 'API'],
    title: 'Backend Engineer',
    verified: true,
    workMode: 'On-site',
  },
  {
    badgeTone: 'blue',
    company: 'Brightlabs',
    companyLogo: {
      alt: 'Brightlabs logo',
      fallbackText: 'BR',
      src: '/company-logos/brightlabs.svg',
      tone: 'coral',
    },
    description: 'Run marketing campaigns, measure performance, and manage automation for growth reporting.',
    field: 'Marketing',
    location: 'Vietnam',
    postedAt: 'Posted 1 day ago',
    salary: '15-20M VND',
    tags: ['CRM', 'Automation', 'Growth'],
    title: 'Marketing Operations Specialist',
    verified: false,
    workMode: 'Remote',
  },
  {
    badgeTone: 'blue',
    company: 'AppForge',
    companyLogo: {
      alt: 'AppForge logo',
      fallbackText: 'AP',
      src: '/company-logos/appforge.svg',
      tone: 'green',
    },
    description: 'Lead a mobile team building new products for international clients, roadmap planning, and technical reviews.',
    field: 'Engineering',
    location: 'Ho Chi Minh City',
    postedAt: 'Posted 3 days ago',
    salary: '35-50M VND',
    tags: ['Mobile', 'Lead', 'Product'],
    title: 'Lead Mobile Engineer',
    verified: true,
    workMode: 'Hybrid',
  },
  {
    badgeTone: 'blue',
    company: 'North Star',
    companyLogo: {
      alt: 'North Star logo',
      fallbackText: 'NS',
      src: '/company-logos/north-star.svg',
      tone: 'blue',
    },
    description: 'Coordinate growth campaigns for a B2B SaaS product.',
    field: 'Marketing',
    location: 'Ha Noi',
    postedAt: 'Posted 4 days ago',
    salary: '22-30M VND',
    tags: ['B2B', 'SaaS', 'Growth'],
    title: 'Growth Marketing Manager',
    verified: true,
    workMode: 'Hybrid',
  },
  {
    badgeTone: 'pink',
    company: 'Luma Studio',
    companyLogo: {
      alt: 'Luma Studio logo',
      fallbackText: 'LU',
      src: '/company-logos/luma-studio.svg',
      tone: 'violet',
    },
    description: 'Design experiences for B2B and B2C hiring products.',
    field: 'Design',
    location: 'Da Nang',
    postedAt: 'Posted 2 days ago',
    salary: '18-24M VND',
    tags: ['Product', 'UX', 'Research'],
    title: 'Product Designer',
    verified: true,
    workMode: 'Remote',
  },
  {
    badgeTone: 'blue',
    company: 'NexHire Tech',
    companyLogo: {
      alt: 'NexHire Tech logo',
      fallbackText: 'NH',
      src: '/company-logos/nexhire-tech.svg',
      tone: 'blue',
    },
    description: 'Partner with enterprise clients to launch hiring workflows.',
    field: 'Business',
    location: 'Ha Noi',
    postedAt: 'Posted today',
    salary: '18-28M VND',
    tags: ['B2B', 'Onboarding', 'CS'],
    title: 'Customer Success Manager',
    verified: true,
    workMode: 'Hybrid',
  },
  {
    badgeTone: 'pink',
    company: 'Luma Studio',
    companyLogo: {
      alt: 'Luma Studio logo',
      fallbackText: 'LU',
      src: '/company-logos/luma-studio.svg',
      tone: 'violet',
    },
    description: 'Analyze customer needs and propose product solutions.',
    field: 'Business',
    location: 'Vietnam',
    postedAt: 'Posted 5 days ago',
    salary: '20-32M VND',
    tags: ['Product', 'Analysis', 'Client'],
    title: 'Business Analyst',
    verified: false,
    workMode: 'Remote',
  },
]

export const homeSampleCompanies: ReadonlyArray<HomeCompanyItem> = [
  {
    logoAlt: 'FPT Software logo',
    logoSrc: '/company-logos/fpt-software.svg',
    logoText: 'FPT',
    name: 'FPT Software',
    openRoles: '124 roles',
    tone: 'coral',
  },
  {
    logoAlt: 'VNG logo',
    logoSrc: '/company-logos/vng.svg',
    logoText: 'VNG',
    name: 'VNG',
    openRoles: '86 roles',
    tone: 'blue',
  },
  {
    logoAlt: 'Tiki logo',
    logoSrc: '/company-logos/tiki.svg',
    logoText: 'TK',
    name: 'Tiki',
    openRoles: '41 roles',
    tone: 'violet',
  },
  {
    logoAlt: 'Grab logo',
    logoSrc: '/company-logos/grab.svg',
    logoText: 'GR',
    name: 'Grab',
    openRoles: '65 roles',
    tone: 'green',
  },
  {
    logoAlt: 'MoMo logo',
    logoSrc: '/company-logos/momo.svg',
    logoText: 'MM',
    name: 'MoMo',
    openRoles: '38 roles',
    tone: 'coral',
  },
  {
    logoAlt: 'Shopee logo',
    logoSrc: '/company-logos/shopee.svg',
    logoText: 'SP',
    name: 'Shopee',
    openRoles: '73 roles',
    tone: 'green',
  },
]
