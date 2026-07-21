import type { CandidateEducation, CandidateExperience, CandidateProfile } from '../types'

type CvDraftProfileFields = Pick<
  CandidateProfile,
  'email' | 'headline' | 'linkedin' | 'location' | 'name' | 'phone' | 'portfolio' | 'summary'
>

export type ParsedCvDraft = {
  education: CandidateEducation[]
  experiences: CandidateExperience[]
  profile: Partial<CvDraftProfileFields>
  skills: string[]
}

const headingPatterns = {
  education: /^(education|academic|học vấn|hoc van|giáo dục|giao duc|đào tạo|dao tao)$/i,
  experience: /^(experience|work experience|employment|professional experience|kinh nghiệm|kinh nghiem|kinh nghiệm làm việc|kinh nghiem lam viec)$/i,
  profile: /^(summary|profile|about|objective|giới thiệu|gioi thieu|mục tiêu|muc tieu)$/i,
  skills: /^(skills|technical skills|core skills|kỹ năng|ky nang|công nghệ|cong nghe)$/i,
}

const anyHeadingPattern = new RegExp(
  [
    headingPatterns.education.source,
    headingPatterns.experience.source,
    headingPatterns.profile.source,
    headingPatterns.skills.source,
  ].join('|'),
  'i',
)

function cleanLine(value: string) {
  return value
    .replace(/^[\s*•\-–—|]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getLines(text: string) {
  return text
    .split(/\r?\n/)
    .map(cleanLine)
}

function getCompactLines(text: string) {
  return getLines(text).filter(Boolean)
}

function findSectionLines(text: string, startPattern: RegExp) {
  const lines = getLines(text)
  const startIndex = lines.findIndex((line) => startPattern.test(line))

  if (startIndex < 0) {
    return []
  }

  const sectionLines: string[] = []

  for (const line of lines.slice(startIndex + 1)) {
    if (line && anyHeadingPattern.test(line)) {
      break
    }

    sectionLines.push(line)
  }

  return sectionLines
}

function splitBlocks(lines: string[]) {
  const blocks: string[][] = []
  let currentBlock: string[] = []

  lines.forEach((line) => {
    if (!line) {
      if (currentBlock.length) {
        blocks.push(currentBlock)
        currentBlock = []
      }

      return
    }

    currentBlock.push(line)
  })

  if (currentBlock.length) {
    blocks.push(currentBlock)
  }

  return blocks
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  values.forEach((value) => {
    const normalizedValue = value.trim()
    const key = normalizedValue.toLowerCase()

    if (!normalizedValue || seen.has(key)) {
      return
    }

    seen.add(key)
    result.push(normalizedValue)
  })

  return result
}

function parseContact(text: string): Partial<CvDraftProfileFields> {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, ' ').trim()
  const linkedin = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i)?.[0]
  const urls = text.match(/https?:\/\/[^\s)]+/gi) ?? []
  const portfolio = urls.find((url) => !url.toLowerCase().includes('linkedin.com'))

  return {
    email,
    linkedin,
    phone,
    portfolio,
  }
}

function parseNameAndHeadline(lines: string[]) {
  const contactPattern = /@|https?:\/\/|\+?\d[\d\s().-]{7,}\d/
  const name = lines.find((line) => line.length <= 80 && !contactPattern.test(line) && !anyHeadingPattern.test(line))
  const headline = lines.find(
    (line) => line !== name && line.length <= 120 && !contactPattern.test(line) && !anyHeadingPattern.test(line),
  )

  return {
    headline,
    name,
  }
}

function parseLocation(lines: string[]) {
  const locationLine = lines.find((line) => /^(location|address|địa chỉ|dia chi)\s*[:|-]/i.test(line))
  return locationLine?.replace(/^(location|address|địa chỉ|dia chi)\s*[:|-]\s*/i, '').trim()
}

function parseSummary(text: string) {
  const summaryLines = findSectionLines(text, headingPatterns.profile).filter(Boolean)

  if (!summaryLines.length) {
    return undefined
  }

  return summaryLines.slice(0, 4).join(' ').slice(0, 500)
}

function parseSkills(text: string) {
  const skillsSection = findSectionLines(text, headingPatterns.skills)
  const source = skillsSection.length ? skillsSection : getCompactLines(text).filter((line) => /^skills?\s*[:|-]/i.test(line))

  return uniqueValues(
    source
      .flatMap((line) => line.replace(/^skills?\s*[:|-]\s*/i, '').split(/[,;|/•]+/))
      .map((skill) => skill.trim())
      .filter((skill) => skill.length >= 2 && skill.length <= 50),
  ).slice(0, 30)
}

function parseDates(lines: string[]) {
  const dateText = lines.join(' ')
  const monthYearMatches = [...dateText.matchAll(/\b(\d{1,2})[/.](\d{4})\b/g)].map((match) => match[0])
  const yearMatches = [...dateText.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => match[0])
  const dates = monthYearMatches.length ? monthYearMatches : yearMatches
  const isCurrent = /(present|current|now|hiện tại|hien tai)/i.test(dateText)

  return {
    endDate: isCurrent ? '' : dates[1] ?? '',
    isCurrent,
    startDate: dates[0] ?? '',
  }
}

function parseRoleCompany(line: string) {
  const separators = [' at ', ' tại ', ' - ', ' | ', ',']
  const separator = separators.find((item) => line.toLowerCase().includes(item.trim() === ',' ? ',' : item))

  if (!separator) {
    return {
      company: '',
      position: line,
    }
  }

  const [firstPart, ...restParts] = line.split(separator)
  const secondPart = restParts.join(separator).trim()

  if (separator.trim() === 'at' || separator.trim() === 'tại') {
    return {
      company: secondPart,
      position: firstPart.trim(),
    }
  }

  return {
    company: secondPart,
    position: firstPart.trim(),
  }
}

export function parseCvTextToProfileDraft(text: string): ParsedCvDraft {
  const lines = getCompactLines(text)
  const contact = parseContact(text)
  const identity = parseNameAndHeadline(lines)
  const location = parseLocation(lines)
  const summary = parseSummary(text)
  const skills = parseSkills(text)
  const timestamp = Date.now()
  const experienceBlocks = splitBlocks(findSectionLines(text, headingPatterns.experience))
  const educationBlocks = splitBlocks(findSectionLines(text, headingPatterns.education))

  return {
    education: educationBlocks.slice(0, 5).map((block, index) => {
      const firstLine = block[0] ?? ''
      const [degree = firstLine, school = block[1] ?? ''] = firstLine.split(/\s[-|]\s/)

      return {
        degree: degree.trim(),
        endYear: parseDates(block).endDate,
        id: `cv-edu-${timestamp}-${index}`,
        school: school.trim(),
        startYear: parseDates(block).startDate,
      }
    }).filter((education) => education.degree || education.school),
    experiences: experienceBlocks.slice(0, 5).map((block, index) => {
      const roleCompany = parseRoleCompany(block[0] ?? '')
      const dates = parseDates(block)

      return {
        company: roleCompany.company || (block[1] ?? ''),
        description: block.slice(1).filter((line) => !/\b(19|20)\d{2}\b/.test(line)).join(' '),
        endDate: dates.endDate,
        id: `cv-exp-${timestamp}-${index}`,
        isCurrent: dates.isCurrent,
        position: roleCompany.position,
        startDate: dates.startDate,
      }
    }).filter((experience) => experience.position || experience.company),
    profile: {
      ...contact,
      headline: identity.headline,
      location,
      name: identity.name,
      summary,
    },
    skills,
  }
}

export function hasParsedCvDraft(draft: ParsedCvDraft) {
  return Boolean(
    Object.values(draft.profile).some(Boolean) ||
      draft.skills.length ||
      draft.experiences.length ||
      draft.education.length,
  )
}
