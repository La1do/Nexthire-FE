import type { CandidateEducation, CandidateExperience, CandidateProfile } from '../types'

export type CvParseReviewGroupId =
  | 'basic'
  | 'contact'
  | 'skills'
  | 'experiences'
  | 'education'
  | 'links'

export type CvParseReviewItem = {
  defaultSelected: boolean
  hasCurrentData: boolean
  hasParsedData: boolean
  id: CvParseReviewGroupId
  isChanged: boolean
}

export const CV_PARSE_REVIEW_GROUPS: CvParseReviewGroupId[] = [
  'basic',
  'contact',
  'skills',
  'experiences',
  'education',
  'links',
]

const BASIC_FIELDS = ['name', 'headline', 'location', 'summary'] as const
const BASIC_REVIEWABLE_FIELDS = ['headline', 'location', 'summary'] as const
const CONTACT_FIELDS = ['contactEmail', 'phone'] as const
const LINK_FIELDS = ['portfolio', 'linkedin'] as const

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim())
}

function isNonEmptyList<T>(items: ReadonlyArray<T>) {
  return items.length > 0
}

function hasAnyText(profile: CandidateProfile, fields: ReadonlyArray<keyof CandidateProfile>) {
  return fields.some((field) => {
    const value = profile[field]
    return typeof value === 'string' && hasText(value)
  })
}

function pickGroupValue(profile: CandidateProfile, group: CvParseReviewGroupId) {
  if (group === 'basic') {
    return BASIC_FIELDS.map((field) => profile[field])
  }

  if (group === 'contact') {
    return CONTACT_FIELDS.map((field) => profile[field])
  }

  if (group === 'links') {
    return LINK_FIELDS.map((field) => profile[field])
  }

  if (group === 'skills') {
    return profile.skills.map((skill) => skill.trim()).filter(Boolean)
  }

  if (group === 'experiences') {
    return profile.experiences.map(normalizeExperience)
  }

  return profile.education.map(normalizeEducation)
}

function normalizeExperience(experience: CandidateExperience) {
  return {
    company: experience.company.trim(),
    description: experience.description.trim(),
    endDate: experience.endDate.trim(),
    isCurrent: experience.isCurrent,
    position: experience.position.trim(),
    startDate: experience.startDate.trim(),
  }
}

function normalizeEducation(education: CandidateEducation) {
  return {
    degree: education.degree.trim(),
    endYear: education.endYear.trim(),
    school: education.school.trim(),
    startYear: education.startYear.trim(),
  }
}

function isSameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function hasProfileReviewableInfo(profile: CandidateProfile) {
  return (
    hasAnyText(profile, BASIC_REVIEWABLE_FIELDS) ||
    hasText(profile.phone) ||
    hasAnyText(profile, LINK_FIELDS) ||
    isNonEmptyList(profile.skills) ||
    isNonEmptyList(profile.experiences) ||
    isNonEmptyList(profile.education)
  )
}

export function isProfileSparse(profile: CandidateProfile) {
  return !hasProfileReviewableInfo(profile)
}

export function hasGroupData(profile: CandidateProfile, group: CvParseReviewGroupId) {
  if (group === 'basic') {
    return hasAnyText(profile, BASIC_FIELDS)
  }

  if (group === 'contact') {
    return hasAnyText(profile, CONTACT_FIELDS)
  }

  if (group === 'links') {
    return hasAnyText(profile, LINK_FIELDS)
  }

  if (group === 'skills') {
    return isNonEmptyList(profile.skills)
  }

  if (group === 'experiences') {
    return isNonEmptyList(profile.experiences)
  }

  return isNonEmptyList(profile.education)
}

export function getCvParseReviewItems(
  baselineProfile: CandidateProfile,
  parsedProfile: CandidateProfile,
): CvParseReviewItem[] {
  return CV_PARSE_REVIEW_GROUPS.map((id) => {
    const hasCurrentData = hasGroupData(baselineProfile, id)
    const hasParsedData = hasGroupData(parsedProfile, id)
    const isChanged = !isSameValue(pickGroupValue(baselineProfile, id), pickGroupValue(parsedProfile, id))

    return {
      defaultSelected: hasParsedData && !hasCurrentData,
      hasCurrentData,
      hasParsedData,
      id,
      isChanged,
    }
  })
}

export function shouldReviewParsedProfile(
  baselineProfile: CandidateProfile,
  parsedProfile: CandidateProfile,
) {
  if (!hasProfileReviewableInfo(baselineProfile)) {
    return false
  }

  return getCvParseReviewItems(baselineProfile, parsedProfile).some(
    (item) => item.hasParsedData && item.isChanged,
  )
}

export function mergeProfileWithLocalChanges(
  parseBaseline: CandidateProfile | null,
  currentProfile: CandidateProfile,
) {
  if (!parseBaseline) {
    return currentProfile
  }

  const mergedProfile = { ...parseBaseline }

  CV_PARSE_REVIEW_GROUPS.forEach((group) => {
    if (isSameValue(pickGroupValue(parseBaseline, group), pickGroupValue(currentProfile, group))) {
      return
    }

    copyGroup(mergedProfile, currentProfile, group)
  })

  return mergedProfile
}

export function mergeParsedProfileWithLocalChanges(
  parsedProfile: CandidateProfile,
  parseBaseline: CandidateProfile | null,
  currentProfile: CandidateProfile,
) {
  const baselineWithLocalChanges = mergeProfileWithLocalChanges(parseBaseline, currentProfile)
  const mergedProfile = { ...parsedProfile }
  let hasLocalChanges = false

  CV_PARSE_REVIEW_GROUPS.forEach((group) => {
    if (isSameValue(pickGroupValue(baselineWithLocalChanges, group), pickGroupValue(parseBaseline ?? baselineWithLocalChanges, group))) {
      return
    }

    hasLocalChanges = true
    copyGroup(mergedProfile, baselineWithLocalChanges, group)
  })

  return { hasLocalChanges, profile: mergedProfile }
}

export function mergeCvParsedProfileBySelection(
  baselineProfile: CandidateProfile,
  parsedProfile: CandidateProfile,
  selectedGroups: ReadonlyArray<CvParseReviewGroupId>,
) {
  const selected = new Set<CvParseReviewGroupId>(selectedGroups)
  const mergedProfile: CandidateProfile = {
    ...baselineProfile,
    defaultCvId: parsedProfile.defaultCvId,
    defaultCvParseStatus: parsedProfile.defaultCvParseStatus,
    resumeFile: parsedProfile.resumeFile,
  }

  CV_PARSE_REVIEW_GROUPS.forEach((group) => {
    if (selected.has(group)) {
      copyGroup(mergedProfile, parsedProfile, group)
    }
  })

  return mergedProfile
}

function copyGroup(
  target: CandidateProfile,
  source: CandidateProfile,
  group: CvParseReviewGroupId,
) {
  if (group === 'basic') {
    target.name = source.name
    target.headline = source.headline
    target.location = source.location
    target.summary = source.summary
    return
  }

  if (group === 'contact') {
    target.contactEmail = source.contactEmail
    target.phone = source.phone
    return
  }

  if (group === 'links') {
    target.portfolio = source.portfolio
    target.linkedin = source.linkedin
    return
  }

  if (group === 'skills') {
    target.skills = [...source.skills]
    return
  }

  if (group === 'experiences') {
    target.experiences = source.experiences.map((experience) => ({ ...experience }))
    return
  }

  target.education = source.education.map((education) => ({ ...education }))
}

export function summarizeCvParseGroup(
  profile: CandidateProfile,
  group: CvParseReviewGroupId,
  options: {
    emptyLabel: string
    moreItemsLabel: string
  },
) {
  const { emptyLabel, moreItemsLabel } = options

  if (group === 'basic') {
    return [profile.name, profile.headline, profile.location, profile.summary]
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(' · ') || emptyLabel
  }

  if (group === 'contact') {
    return [profile.contactEmail, profile.phone]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' · ') || emptyLabel
  }

  if (group === 'links') {
    return [profile.portfolio, profile.linkedin]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' · ') || emptyLabel
  }

  if (group === 'skills') {
    return summarizeList(profile.skills, emptyLabel, moreItemsLabel)
  }

  if (group === 'experiences') {
    return summarizeList(
      profile.experiences.map((experience) =>
        [experience.position, experience.company].filter(Boolean).join(' · '),
      ),
      emptyLabel,
      moreItemsLabel,
    )
  }

  return summarizeList(
    profile.education.map((education) =>
      [education.degree, education.school].filter(Boolean).join(' · '),
    ),
    emptyLabel,
    moreItemsLabel,
  )
}

function summarizeList(items: ReadonlyArray<string>, emptyLabel: string, moreItemsLabel: string) {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean)

  if (cleanItems.length === 0) {
    return emptyLabel
  }

  const visibleItems = cleanItems.slice(0, 3)
  const hiddenCount = cleanItems.length - visibleItems.length

  if (hiddenCount <= 0) {
    return visibleItems.join(' · ')
  }

  return `${visibleItems.join(' · ')} · ${moreItemsLabel.replace('{count}', String(hiddenCount))}`
}
