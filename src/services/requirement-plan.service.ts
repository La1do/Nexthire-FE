import { apiClient } from '../lib/api'
import type { Envelope } from '../types/job.types'
import { parsePlanInspection } from '../types/requirement-plan.types'
import type { PlanHistory, PlannedRequirement } from '../types/requirement-plan.types'
const base = (id: string) => `/recruiter/jobs/${encodeURIComponent(id)}/requirement-plan`
export const requirementPlanService = {
  async inspect(id: string, signal?: AbortSignal) {
    const r = await apiClient.get<Envelope<unknown>>(base(id), { signal })
    if (r.data.success !== true) throw new Error('Invalid plan envelope')
    return parsePlanInspection(r.data.data, id)
  },
  async draft(id: string, expectedLatestRevision: number, signal?: AbortSignal) {
    const r = await apiClient.post<Envelope<unknown>>(`${base(id)}/drafts`, { expectedLatestRevision }, { signal })
    if (r.data.success !== true) throw new Error('Invalid plan envelope')
    return parsePlanInspection(r.data.data, id)
  },
  async save(id: string, expectedContentSha256: string, requirements: PlannedRequirement[], signal?: AbortSignal) {
    const r = await apiClient.patch<Envelope<unknown>>(base(id), { expectedContentSha256, requirements }, { signal })
    if (r.data.success !== true) throw new Error('Invalid plan envelope')
    return parsePlanInspection(r.data.data, id)
  },
  async confirm(id: string, expectedContentSha256: string, signal?: AbortSignal) {
    const r = await apiClient.post<Envelope<unknown>>(`${base(id)}/confirm`, { expectedContentSha256 }, { signal })
    if (r.data.success !== true) throw new Error('Invalid plan envelope')
    return parsePlanInspection(r.data.data, id)
  },
  async history(id: string, signal?: AbortSignal) {
    const r = await apiClient.get<Envelope<PlanHistory>>(`${base(id)}/history`, { signal })
    const h = r.data.data
    if (r.data.success !== true || !h || !Array.isArray(h.revisions) || h.revisions.length > 50
      || !Array.isArray(h.events) || h.events.length > 100
      || h.revisions.some(row => row.jobId !== id || row.document?.job_id !== id)
      || h.events.some(row => row.jobId !== id)) throw new Error('Invalid history response')
    return h
  },
}