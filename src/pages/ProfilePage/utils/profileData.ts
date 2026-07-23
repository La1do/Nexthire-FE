import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'

export function createCandidateProfile(source: ProfileTranslations['profile']): CandidateProfile {
  return {
    avatarDocumentId: null,
    contactEmail: source.contactEmail,
    defaultCvId: null,
    education: source.education.map((item) => ({ ...item })),
    experiences: source.experiences.map((item) => ({ ...item })),
    headline: source.headline,
    linkedin: source.linkedin,
    location: source.location,
    name: source.name,
    phone: source.phone,
    portfolio: source.portfolio,
    resumeFile: source.resumeFile,
    skills: [...source.skills],
    summary: source.summary,
  }
}
