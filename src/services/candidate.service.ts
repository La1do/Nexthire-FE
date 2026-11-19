import { z } from 'zod'
import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '../lib/api'
import type {
  CandidateCvResponse,
  CandidateMeResponse,
  CandidateUpdatePayload,
} from '../types/candidate.types'
import type { Envelope } from '../types/job.types'

const uuid = z.string().uuid()
const cvSources = z.enum(['HEADLINE', 'SUMMARY', 'SKILLS', 'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'])
const recommendationCvSchema = z.object({ id: uuid, title: z.string().nullable(), parseStatus: z.enum(['NOT_PARSED', 'PARSING', 'PARSED', 'FAILED']), parsedAt: z.string().nullable(), updatedAt: z.string() })
const recommendationJobSchema = z.object({
  id: uuid,
  title: z.string(),
  companyName: z.string().nullable(),
  location: z.string().nullable(),
  workingType: z.string().nullable(),
  experienceLevel: z.string().nullable(),
  publishedAt: z.string().datetime({ offset: true }),
})
const poolSchema = z.object({
  limit: z.literal(100),
  considered: z.number().int().min(0).max(100),
  truncated: z.boolean(),
  order: z.literal('PUBLISHED_AT_DESC_ID_ASC'),
})
const recommendationSourceSchema = z.object({
  candidateCvId: uuid,
  parseResultId: uuid,
  cvSnapshotSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sourceCheckedAt: z.string().datetime({ offset: true }).optional(),
  warnings: z.array(z.string()).optional(),
  fitScore: z.null(),
  candidateSupportVerified: z.literal(false),
  applicationCreated: z.literal(false),
})
const keywordRecommendationSchema = recommendationSourceSchema.extend({
  schemaVersion: z.literal('candidate-job-recommendations-v1'),
  method: z.literal('KEYWORD_OVERLAP_V1'),
  scoreMeaning: z.literal('DISTINCT_SHARED_TERMS_NOT_FIT_OR_SUPPORT'),
  status: z.enum(['READY', 'EMPTY']),
  reason: z.enum(['NO_PUBLIC_JOBS', 'NO_KEYWORD_OVERLAP', 'CV_TEXT_EMPTY']).nullable(),
  pool: poolSchema,
  items: z.array(z.object({
    rank: z.number().int().positive(),
    keywordScore: z.number().int().min(1).max(512),
    matchedTerms: z.array(z.object({
      term: z.string().min(1).max(64),
      cvSources: z.array(cvSources).min(1),
      jobSources: z.array(z.enum(['TITLE', 'SKILLS', 'REQUIREMENTS', 'DESCRIPTION'])).min(1),
    })).min(1).max(20),
    job: recommendationJobSchema,
  })).max(20),
})
const semanticRecommendationSchema = recommendationSourceSchema.extend({
  schemaVersion: z.literal('candidate-job-recommendations-v2'),
  method: z.literal('M1_REQUIREMENT_SEMANTIC_V1'),
  scoreMeaning: z.literal('RELATIVE_SEMANTIC_SIMILARITY'),
  status: z.enum(['READY', 'READY_PARTIAL', 'EMPTY', 'INDEX_WARMING']),
  reason: z.enum(['NO_PUBLIC_JOBS', 'CV_TEXT_EMPTY', 'JD_INDEX_PENDING']).nullable(),
  modelVersion: z.string().trim().min(1),
  pool: poolSchema.extend({ indexed: z.number().int().min(0).max(100) }),
  items: z.array(z.object({
    rank: z.number().int().positive(),
    semanticScore: z.number().min(-1.000001).max(1.000001),
    evidence: z.array(z.object({
      cvSource: cvSources,
      cvText: z.string().trim().min(1).max(4000),
      jobText: z.string().trim().min(1).max(4000),
    })).max(2),
    job: recommendationJobSchema,
  })).max(20),
})
const recommendationSchema = z.discriminatedUnion('schemaVersion', [
  keywordRecommendationSchema,
  semanticRecommendationSchema,
]).superRefine((data, context) => {
  const invalid = (message: string) => context.addIssue({ code: 'custom', message })
  if (
    data.items.length > data.pool.considered ||
    new Set(data.items.map(item => item.job.id)).size !== data.items.length ||
    data.items.some((item, index) => item.rank !== index + 1)
  ) invalid('Invalid recommendation ranking')

  if (data.schemaVersion === 'candidate-job-recommendations-v1') {
    if (data.status === 'READY' ? !data.items.length || data.reason !== null : data.items.length !== 0 || data.reason === null) invalid('Invalid keyword recommendation status')
    if (data.items.some((item, index) =>
      item.keywordScore < item.matchedTerms.length ||
      new Set(item.matchedTerms.map(hit => hit.term)).size !== item.matchedTerms.length ||
      (index > 0 && item.keywordScore > data.items[index - 1].keywordScore)
    )) invalid('Invalid keyword ranking')
    return
  }

  const hasRecommendations = data.status === 'READY' || data.status === 'READY_PARTIAL'
  if (
    hasRecommendations !== (data.items.length > 0) ||
    (data.status === 'READY' && data.reason !== null) ||
    (data.status === 'READY_PARTIAL' && data.reason !== null && data.reason !== 'JD_INDEX_PENDING') ||
    (data.status === 'EMPTY' && data.reason !== 'NO_PUBLIC_JOBS' && data.reason !== 'CV_TEXT_EMPTY') ||
    (data.status === 'INDEX_WARMING' && data.reason !== 'JD_INDEX_PENDING')
  ) invalid('Invalid semantic recommendation status')
  if (
    data.pool.indexed > data.pool.considered ||
    data.items.length > data.pool.indexed ||
    data.items.some((item, index) => index > 0 && item.semanticScore > data.items[index - 1].semanticScore)
  ) invalid('Invalid semantic ranking')
})
export type RecommendationCv = z.infer<typeof recommendationCvSchema>
export type CandidateJobRecommendations = z.infer<typeof recommendationSchema>
const recommendationRequest = (signal?: AbortSignal): AxiosRequestConfig => ({ signal, timeout: 45000 })

export const candidateService = {
  async getRecommendationCvs(userId: string, signal?: AbortSignal): Promise<RecommendationCv[]> {
    const response = await apiClient.get('/candidates/me', recommendationRequest(signal))
    const data = z.object({ success: z.literal(true), data: z.object({ profile: z.object({ userId: uuid }), cvs: z.array(recommendationCvSchema) }) }).parse(response.data).data
    if (data.profile.userId !== userId || new Set(data.cvs.map(cv => cv.id)).size !== data.cvs.length) throw new Error('Wrong CV owner')
    return data.cvs
  },
  async parseCvForRecommendations(cvId: string, signal?: AbortSignal): Promise<RecommendationCv> {
    const id = uuid.parse(cvId)
    const config: AxiosRequestConfig & { _retry: true } = { ...recommendationRequest(signal), _retry: true }
    const response = await apiClient.post(`/cvs/${id}/parse-for-recommendations`, undefined, config)
    const data = z.object({ success: z.literal(true), data: recommendationCvSchema }).parse(response.data).data
    if (data.id !== id) throw new Error('Wrong recommendation CV parse binding')
    return data
  },
  async getJobRecommendations(cvId: string, signal?: AbortSignal): Promise<CandidateJobRecommendations> {
    const response = await apiClient.get(`/candidates/me/cvs/${uuid.parse(cvId)}/job-recommendations`, { ...recommendationRequest(signal), params: { limit: 10 } })
    const data = z.object({ success: z.literal(true), data: recommendationSchema }).parse(response.data).data
    if (data.candidateCvId !== cvId || data.items.length > 10) throw new Error('Wrong recommendation CV binding')
    return data
  },
  async getMyProfile() {
    const response = await apiClient.get<Envelope<CandidateMeResponse>>('/candidates/me')
    return response.data.data
  },
  async updateMyProfile(payload: CandidateUpdatePayload) {
    const response = await apiClient.patch<Envelope<CandidateMeResponse>>('/candidates/me', payload)
    return response.data.data
  },
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.patch<Envelope<CandidateMeResponse>>('/candidates/me/avatar', formData)
    return response.data.data
  },
  async uploadCv(file: File, options?: { isDefault?: boolean; parse?: boolean; title?: string }) {
    const formData = new FormData()
    formData.append('file', file)

    if (options?.title) {
      formData.append('title', options.title)
    }

    if (options?.isDefault !== undefined) {
      formData.append('isDefault', String(options.isDefault))
    }

    if (options?.parse !== undefined) {
      formData.append('parse', String(options.parse))
    }

    const response = await apiClient.post<Envelope<CandidateCvResponse>>('/cvs/upload', formData)
    return response.data.data
  },
  async parseCv(id: string) {
    const response = await apiClient.post<Envelope<CandidateCvResponse>>(`/cvs/${id}/parse`)
    return response.data.data
  },
  async deleteCv(id: string) {
    const response = await apiClient.delete<Envelope<{ deleted: true }>>(`/cvs/${id}`)
    return response.data.data
  },
}
