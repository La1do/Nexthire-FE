import type {
  CandidateEducationPayload,
  CandidateExperiencePayload,
  CandidateMeResponse,
  CandidateUpdatePayload,
} from '../../../types/candidate.types'
import type { CandidateEducation, CandidateExperience, CandidateProfile } from '../types'

function compact(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? ''
  return trimmedValue || null
}

function formatMonthYear(month: number | null, year: number | null) {
  if (!year) {
    return ''
  }

  if (!month) {
    return String(year)
  }

  return `${String(month).padStart(2, '0')}/${year}`
}

function parseMonthYear(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return {
      month: null,
      year: null,
    }
  }

  const monthYearMatch = /^(\d{1,2})[/-](\d{4})$/.exec(trimmedValue)

  if (monthYearMatch) {
    return {
      month: Number(monthYearMatch[1]),
      year: Number(monthYearMatch[2]),
    }
  }

  const yearMatch = /^(\d{4})$/.exec(trimmedValue)

  return {
    month: null,
    year: yearMatch ? Number(yearMatch[1]) : null,
  }
}

function parseYear(value: string) {
  const parsedValue = Number(value.trim())
  return Number.isInteger(parsedValue) ? parsedValue : null
}

export function createProfileFromCandidateAggregate(data: CandidateMeResponse): CandidateProfile {
  const defaultCv = data.defaultCv ?? data.cvs.find((cv) => cv.isDefault) ?? data.cvs[0]

  return {
    avatarDocumentId: data.profile.avatarDocumentId,
    defaultCvId: defaultCv?.id ?? null,
    education: data.educations.map((education): CandidateEducation => ({
      degree: education.degree ?? education.fieldOfStudy ?? '',
      endYear: education.endYear ? String(education.endYear) : '',
      id: education.id,
      school: education.schoolName,
      startYear: education.startYear ? String(education.startYear) : '',
    })),
    email: data.profile.contactEmail ?? '',
    experiences: data.experiences.map((experience): CandidateExperience => ({
      company: experience.companyName,
      description: experience.description ?? '',
      endDate: formatMonthYear(experience.endMonth, experience.endYear),
      id: experience.id,
      isCurrent: experience.isCurrent,
      position: experience.position,
      startDate: formatMonthYear(experience.startMonth, experience.startYear),
    })),
    headline: data.profile.headline ?? '',
    linkedin: data.profile.linkedinUrl ?? '',
    location: data.profile.location ?? '',
    name: data.profile.fullName ?? '',
    phone: data.profile.phone ?? '',
    portfolio: data.profile.portfolioUrl ?? '',
    resumeFile: defaultCv?.title ?? '',
    skills: data.skills.map((skill) => skill.name),
    summary: data.profile.summary ?? '',
  }
}

function createExperiencePayload(experience: CandidateExperience): CandidateExperiencePayload | null {
  const companyName = compact(experience.company)
  const position = compact(experience.position)

  if (!companyName || !position) {
    return null
  }

  const startDate = parseMonthYear(experience.startDate)
  const endDate = parseMonthYear(experience.endDate)

  return {
    companyName,
    position,
    startMonth: startDate.month,
    startYear: startDate.year,
    endMonth: experience.isCurrent ? null : endDate.month,
    endYear: experience.isCurrent ? null : endDate.year,
    isCurrent: experience.isCurrent,
    description: compact(experience.description),
  }
}

function createEducationPayload(education: CandidateEducation): CandidateEducationPayload | null {
  const schoolName = compact(education.school)

  if (!schoolName) {
    return null
  }

  return {
    schoolName,
    degree: compact(education.degree),
    startYear: parseYear(education.startYear),
    endYear: parseYear(education.endYear),
  }
}

export function createCandidateUpdatePayload(profile: CandidateProfile): CandidateUpdatePayload {
  return {
    profile: {
      avatarDocumentId: profile.avatarDocumentId,
      contactEmail: compact(profile.email),
      fullName: compact(profile.name),
      headline: compact(profile.headline),
      linkedinUrl: compact(profile.linkedin),
      location: compact(profile.location),
      phone: compact(profile.phone),
      portfolioUrl: compact(profile.portfolio),
      summary: compact(profile.summary),
    },
    skills: profile.skills
      .map((skill) => skill.trim())
      .filter(Boolean)
      .map((name) => ({ name })),
    experiences: profile.experiences
      .map(createExperiencePayload)
      .filter((experience): experience is CandidateExperiencePayload => Boolean(experience)),
    educations: profile.education
      .map(createEducationPayload)
      .filter((education): education is CandidateEducationPayload => Boolean(education)),
  }
}
