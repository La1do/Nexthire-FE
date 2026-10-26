import { z } from 'zod'

const evidence = z.object({
  evidenceId: z.string(), source: z.string(), text: z.string(),
  similarityScore: z.number().min(0).max(100),
  reasonCodes: z.array(z.string()).optional(),
  scoreMeaning: z.literal('COSINE_RETRIEVAL_SIMILARITY_NOT_SUPPORT_PROBABILITY'),
})
const suggestion = z.enum(['matched', 'partial', 'not_established_in_provided_evidence']).nullable()
const component = z.object({
  componentId: z.string(), text: z.string(), importance: z.string(),
  modelSuggestion: suggestion, retrievalStatus: z.string().nullable().optional(),
  reasonCodes: z.array(z.string()).optional(), verifiedSupport: z.literal(false),
  evidence: z.array(evidence).max(3),
})
const requirementBase = z.object({
  requirementId: z.string(), text: z.string(), modelSuggestion: suggestion,
  retrievalStatus: z.string().nullable().optional(), reasonCodes: z.array(z.string()).optional(),
  jointContextRequired: z.boolean().nullable().optional(), verifiedSupport: z.literal(false),
  evidence: z.array(evidence).max(3),
  componentAnalysis: z.enum(['NOT_PERFORMED', 'FIXED_PLAN_UNVERIFIED_PROPOSALS', 'FIXED_PLAN_RETRIEVAL']),
  allOf: z.array(z.array(z.string()).min(1)).nullable(), components: z.array(component).nullable(),
})
function checkComponents(value: { components: Array<{ componentId: string }> | null; allOf: string[][] | null }, ctx: z.RefinementCtx) {
  const ids = value.components?.map((item) => item.componentId) ?? []
  if (new Set(ids).size !== ids.length || value.allOf?.flat().some((id) => !ids.includes(id))) {
    ctx.addIssue({ code: 'custom', message: 'Invalid component references' })
  }
}
const requirement = requirementBase.superRefine(checkComponents)

// Mirrors the authenticated BE projection; retrieval is not support verification.
const reviewV1 = z.object({
  schemaVersion: z.literal('hr-review-v1'), resultId: z.string(),
  applicationId: z.string().nullable(), jobId: z.string(), candidateId: z.string(),
  candidateCvId: z.string().nullable(), executionStatus: z.string(),
  assessmentStatus: z.enum(['PENDING_REVIEW', 'NOT_PERFORMED', 'UNAVAILABLE']), reason: z.string(),
  scope: z.literal('RETRIEVED_EVIDENCE_ONLY'), decisionAuthority: z.literal('HR'),
  candidateSupportVerified: z.literal(false), automaticallyReject: z.literal(false),
  isTrainingLabel: z.literal(false), overallFitScore: z.null(), hiringDecision: z.null(), rankingPosition: z.null(),
  planStatus: z.string().nullable(), planContentSha256: z.string().nullable(),
  planStateScope: z.literal('AT_MATCHING_TIME'), currentPlanRevalidated: z.literal(false),
  jobSnapshotSha256: z.string().nullable(), candidateSnapshotSha256: z.string().nullable(),
  syntheticTestOnly: z.boolean().nullable(), retrievalModelVersion: z.string().nullable(),
  verifierModelVersion: z.string().nullable(),
  assessmentSource: z.enum(['M1_RETRIEVAL', 'VERIFIER_DIAGNOSTIC']).nullable().optional(),
  retrievalWarnings: z.array(z.string()).optional(), requirements: z.array(requirement),
  baselineDiagnostics: z.null(),
})

export const hrReviewSchema = reviewV1.superRefine((value, ctx) => {
  const ids = value.requirements.map((item) => item.requirementId)
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Duplicate requirements' })
  if (value.assessmentStatus !== 'PENDING_REVIEW' && value.requirements.length) {
    ctx.addIssue({ code: 'custom', message: 'Unavailable assessment carries evidence' })
  }
  if (value.assessmentSource === 'M1_RETRIEVAL' && value.requirements.some((item) =>
    item.modelSuggestion !== null || item.components?.some((part) => part.modelSuggestion !== null))) {
    ctx.addIssue({ code: 'custom', message: 'Retrieval must not assert support' })
  }
})
export type HrReview = z.infer<typeof hrReviewSchema>
export type HrEvidence = HrReview['requirements'][number]['evidence'][number]

export function parseHrReviewEnvelope(payload: unknown, applicationId: string, jobId: string): HrReview | null {
  const envelope = z.object({ success: z.literal(true), data: hrReviewSchema.nullable() }).parse(payload)
  if (envelope.data && (envelope.data.applicationId !== applicationId || envelope.data.jobId !== jobId)) {
    throw new Error('HR review identity mismatch')
  }
  return envelope.data
}
