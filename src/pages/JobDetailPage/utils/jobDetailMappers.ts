import type { JobDetailTranslations } from '../../../i18n/types'
import type { JobWorkingType, PublicCategory, PublicJobDetail, PublicJobListItem } from '../../../types/job.types'
import type { PublicCompanyProfile } from '../../../types/company.types'
import {
  formatPostedAt,
  formatSalary,
  initials,
  pickTone,
  type PostedLabels,
} from '../../_utils/jobFormat'
import type {
  JobCompanyInfo,
  JobDetailHighlightBox,
  JobDetailLocationTime,
  JobDetailOverviewData,
  JobDetailSectionView,
  JobDetailView,
  JobLogoView,
} from '../types'

// Labels the mappers need from i18n so no user-facing text is hardcoded here.
export type JobDetailLabels = PostedLabels & {
  workingType: Record<JobWorkingType, string>
  salaryNegotiable: string
}

function mapLogo(companyId: string, company: string, logoUrl: string | null): JobLogoView {
  return {
    alt: `${company} logo`,
    fallbackText: initials(company),
    src: logoUrl ?? '',
    tone: pickTone(companyId || company),
  }
}

function formatTopCvSalary(job: PublicJobDetail, locale: string, labels: JobDetailLabels): string {
  if (!job.isSalaryVisible || job.salaryMin == null) {
    return labels.salaryNegotiable
  }

  if (job.salaryCurrency === 'VND') {
    const minM = Math.round(job.salaryMin / 1_000_000)
    if (job.salaryMax != null && job.salaryMax !== job.salaryMin) {
      const maxM = Math.round(job.salaryMax / 1_000_000)
      return `${minM} - ${maxM} triệu`
    }
    return `${minM} triệu`
  }

  return formatSalary(job, locale, labels.salaryNegotiable)
}

function formatTopCvDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Chưa xác định'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Chưa xác định'
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export function mapJobDetail(
  job: PublicJobDetail,
  locale: string,
  labels: JobDetailLabels,
  companyProfile?: PublicCompanyProfile | null,
  categoryList?: PublicCategory[] | null,
): JobDetailView {
  const company = companyProfile?.name || job.companyName || 'Công ty tuyển dụng'
  const logoUrl = companyProfile?.logoUrl || companyProfile?.logo || job.companyLogoUrl

  const experienceLevelMap: Record<string, string> = {
    INTERN: 'Thực tập sinh',
    FRESHER: 'Mới tốt nghiệp / Fresher',
    JUNIOR: '1 - 2 năm',
    MIDDLE: '2 - 3 năm',
    SENIOR: '3 - 5 năm',
    LEAD: 'Trên 5 năm',
  }

  const experienceLevelLabel = experienceLevelMap[job.experienceLevel] ?? '1 - 3 năm'

  const levelMap: Record<string, string> = {
    INTERN: 'Thực tập sinh',
    FRESHER: 'Fresher',
    JUNIOR: 'Nhân viên',
    MIDDLE: 'Chuyên viên',
    SENIOR: 'Chuyên viên cao cấp',
    LEAD: 'Trưởng nhóm / Quản lý',
  }

  const levelLabel = levelMap[job.experienceLevel] ?? 'Nhân viên'

  // Resolve category name from list
  const matchedCategory = categoryList?.find((c) => c.id === job.categoryId)
  const categoryName =
    matchedCategory?.name ||
    (job.title.toLowerCase().includes('engineer') ||
    job.title.toLowerCase().includes('developer') ||
    job.title.toLowerCase().includes('frontend') ||
    job.title.toLowerCase().includes('backend')
      ? 'Công nghệ thông tin'
      : '')

  const companyInfo: JobCompanyInfo = {
    id: job.companyId,
    name: company,
    logoUrl,
    scale: companyProfile?.size ? `${companyProfile.size} nhân viên` : null,
    address: companyProfile?.address || job.location,
    industry: companyProfile?.industry || null,
  }

  // Build overview requirements and benefits dynamically from job & company
  const requirements = [
    `${experienceLevelLabel} kinh nghiệm`,
    'Đại Học trở lên',
  ]

  const overviewBenefits: string[] = []
  if (companyProfile?.perks && companyProfile.perks.length > 0) {
    overviewBenefits.push(...companyProfile.perks.slice(0, 4))
  } else if (job.benefits) {
    const parsed = job.benefits
      .split(/\r?\n/)
      .map((s) => s.replace(/^[\s•*+⁃–—-]*(\d+[.)])?\s*/, '').trim())
      .filter(Boolean)
    overviewBenefits.push(...parsed.slice(0, 4))
  }

  const specialties = job.skills && job.skills.length > 0 ? job.skills : []

  const overview: JobDetailOverviewData = {
    requirements,
    benefits: overviewBenefits,
    specialties,
  }

  // Dynamic candidate highlights from actual job skills
  const candidateHighlights: JobDetailHighlightBox[] = []
  if (job.skills && job.skills.length > 0) {
    candidateHighlights.push({
      iconType: 'knowledge',
      label: 'Kiến thức chuyên môn',
      value: job.skills.join(', '),
    })
    candidateHighlights.push({
      iconType: 'requiredSkill',
      label: 'Kỹ năng cần có',
      value: job.skills.slice(0, 2).join(', ') || job.skills[0],
    })
    candidateHighlights.push({
      iconType: 'preferredSkill',
      label: 'Kỹ năng nên có',
      value: [job.skills.slice(2).join(', '), job.title].filter(Boolean).join(', '),
    })
  }

  const supplementalBenefits =
    companyProfile?.perks && companyProfile.perks.length > 0 ? companyProfile.perks : []

  const workHours = [
    'Thứ 2 - Thứ 6 (từ 08:30 đến 17:30)',
    job.workingType === 'HYBRID'
      ? 'Chế độ làm việc linh hoạt (Hybrid)'
      : job.workingType === 'REMOTE'
        ? 'Làm việc từ xa (Remote)'
        : 'Làm việc tại văn phòng',
  ]

  const locationTime: JobDetailLocationTime = {
    workLocation: companyProfile?.address
      ? `${job.location}: ${companyProfile.address}`
      : job.location,
    workHours,
    applyNote: 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới đây.',
  }

  return {
    id: job.id,
    companyId: job.companyId,
    company,
    title: job.title,
    location: job.location,
    workMode:
      job.workingType === 'ONSITE'
        ? 'Làm việc tại văn phòng / Onsite'
        : (labels.workingType[job.workingType] ?? job.workingType),
    salary: formatTopCvSalary(job, locale, labels),
    postedAt: formatPostedAt(job.publishedAt, locale, labels),
    deadline: formatTopCvDate(job.deadline),
    openings: job.numberOfOpenings ?? 1,
    tags: job.skills || [],
    verified: true,
    logo: mapLogo(job.companyId, company, logoUrl),
    experienceLevelLabel,
    categoryName,
    levelLabel,
    educationLabel: 'Đại Học trở lên',
    employmentTypeLabel: job.employmentType === 'FULL_TIME' ? 'Toàn thời gian' : 'Bán thời gian',
    overview,
    candidateHighlights: candidateHighlights.length > 0 ? candidateHighlights : undefined,
    supplementalBenefits: supplementalBenefits.length > 0 ? supplementalBenefits : undefined,
    locationTime,
    companyInfo,
  }
}

// Build the rendered content blocks from the long-form API fields. Section
// titles come from i18n; bodies come from the job. Empty fields are skipped.
export function mapJobDetailSections(
  job: PublicJobDetail,
  titles: JobDetailTranslations['sections'],
): ReadonlyArray<JobDetailSectionView> {
  const blocks: ReadonlyArray<{
    key: 'description' | 'requirements' | 'benefits'
    title: string
    body: string | null
  }> = [
    { key: 'description', title: titles?.description || 'Mô tả công việc', body: job.description },
    { key: 'requirements', title: titles?.requirements || 'Yêu cầu ứng viên', body: job.requirements },
    { key: 'benefits', title: titles?.benefits || 'Quyền lợi ứng viên', body: job.benefits },
  ]

  const mapped = blocks
    .filter(
      (
        block,
      ): block is {
        key: 'description' | 'requirements' | 'benefits'
        title: string
        body: string
      } => Boolean(block.body?.trim()),
    )
    .map((block) => ({ key: block.key, title: block.title, body: block.body }))

  return mapped
}

export function mapRelatedJob(job: PublicJobListItem) {
  const company = job.companyName ?? '—'

  return {
    id: job.id,
    companyId: job.companyId,
    company,
    title: job.title,
    location: job.location,
    logo: mapLogo(job.companyId, company, job.companyLogoUrl),
  }
}
