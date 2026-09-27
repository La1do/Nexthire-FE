/**
 * Fixed sample data for the dev-only applications mock (BE-off testing).
 * Pure constants/functions only: no top-level side effects, so production builds
 * drop this module together with the mock variants.
 */
import type { ApplicationResponse } from '../../types/application.types'

type MockAiMatchResult = Required<
  Pick<
    ApplicationResponse,
    | 'matchDecision'
    | 'matchLevel'
    | 'matchMatchedSkills'
    | 'matchMissingSkills'
    | 'matchNextActions'
    | 'matchPriority'
    | 'matchRecommendation'
    | 'matchRiskFlags'
    | 'matchScore'
    | 'matchSummary'
  >
>

/** Fixed AI match result written onto a CV when "Run AI match" is used in mock mode (same for every CV). */
export function createMockAiMatchResult(): MockAiMatchResult {
  return {
    matchDecision: 'SHORTLIST',
    matchLevel: 'HIGH',
    matchMatchedSkills: ['TypeScript', 'React', 'REST APIs'],
    matchMissingSkills: ['GraphQL'],
    matchNextActions: ['Schedule a technical interview', 'Ask for a recent project walkthrough'],
    matchPriority: 'HIGH',
    matchRecommendation: 'GOOD_FIT',
    matchRiskFlags: ['Sample data from the dev mock'],
    matchScore: 82,
    matchSummary: 'Sample AI match (mock data): strong frontend fit, most required skills are covered.',
  }
}

const SAMPLE_CV_LINES = [
  'NexHire - Sample CV (mock data)',
  'This placeholder file is served by the dev-only mock.',
  'No real candidate data. No backend request was made.',
]

/** One tiny, valid single-page PDF (Helvetica text), built with correct xref offsets. */
export function buildSampleCvPdf(): string {
  const content = SAMPLE_CV_LINES.map(
    (line, index) => `BT /F1 ${index === 0 ? 18 : 11} Tf 60 ${780 - index * 24} Td (${line}) Tj ET`,
  ).join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return pdf
}

/** How long the mock CV link stays valid (mirrors the signed-URL expiry of the real endpoint). */
export const MOCK_CV_URL_TTL_SECONDS = 300
