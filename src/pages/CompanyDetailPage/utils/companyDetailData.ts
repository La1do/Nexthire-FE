import type {
  CompanyDetailProfile,
  CompanyDetailTranslations,
  HomeCompanyItem,
  HomeJobItem,
  HomeTranslations,
} from '../../../i18n/types'
import { createCompanySlug, getHomeJobList } from '../../_utils/jobRoutes'

export type CompanyDetailViewModel = CompanyDetailProfile & {
  isVerified: boolean
  logo: HomeJobItem['companyLogo']
  openJobs: ReadonlyArray<HomeJobItem>
  slug: string
}

type CompanyBase = {
  isVerified: boolean
  logo: HomeJobItem['companyLogo']
  name: string
}

function toLogoFromCompany(item: HomeCompanyItem): HomeJobItem['companyLogo'] {
  return {
    alt: item.logoAlt,
    fallbackText: item.logoText,
    src: item.logoSrc,
    tone: item.tone,
  }
}

function createLogoFromName(name: string): HomeJobItem['companyLogo'] {
  const fallbackText = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    alt: `${name} logo`,
    fallbackText,
    src: '',
    tone: 'blue',
  }
}

function collectCompanyBases(home: HomeTranslations) {
  const bases = new Map<string, CompanyBase>()

  for (const job of getHomeJobList(home)) {
    const slug = createCompanySlug(job.company)
    const current = bases.get(slug)

    bases.set(slug, {
      isVerified: Boolean(current?.isVerified || job.verified),
      logo: current?.logo ?? job.companyLogo,
      name: job.company,
    })
  }

  for (const company of [...home.hero.spotlight.items, ...home.employers.items]) {
    const slug = createCompanySlug(company.name)

    if (!bases.has(slug)) {
      bases.set(slug, {
        isVerified: true,
        logo: toLogoFromCompany(company),
        name: company.name,
      })
    }
  }

  return bases
}

function createFallbackProfile(
  slug: string,
  base: CompanyBase,
  fallback: CompanyDetailTranslations['fallbackProfile'],
): CompanyDetailProfile {
  return {
    ...fallback,
    heroImage: `https://picsum.photos/seed/${slug}-company-workspace/960/640`,
    name: base.name,
    website: `https://${slug}.vn`,
  }
}

export function findCompanyDetailBySlug(
  home: HomeTranslations,
  content: CompanyDetailTranslations,
  slug: string,
): CompanyDetailViewModel | undefined {
  const normalizedSlug = slug || ''
  const bases = collectCompanyBases(home)
  const profile = content.profiles.find((item) => createCompanySlug(item.name) === normalizedSlug)
  const base = bases.get(normalizedSlug) ?? (profile ? {
    isVerified: true,
    logo: createLogoFromName(profile.name),
    name: profile.name,
  } : undefined)

  if (!base) {
    return undefined
  }

  const resolvedProfile = profile ?? createFallbackProfile(normalizedSlug, base, content.fallbackProfile)
  const openJobs = getHomeJobList(home).filter((job) => createCompanySlug(job.company) === normalizedSlug)

  return {
    ...resolvedProfile,
    isVerified: base.isVerified,
    logo: base.logo,
    openJobs,
    slug: normalizedSlug,
  }
}
