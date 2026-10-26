export type PlanImportance = 'core' | 'supplementary' | 'preferred' | 'unknown'
export type PlanComponent = { id: string; query: string; source_quote: string; importance: PlanImportance }
export type PlannedRequirement = {
  requirement_id: string; original_text: string; components: PlanComponent[]
  all_of: string[][]; joint_context_required: boolean
}
export type PlanDocument = {
  schema_version: 'jd-fixed-requirements-v1'; job_id: string; job_snapshot_sha256: string
  revision: number; requirements: PlannedRequirement[]
  approval: null | { origin: string; reviewer_id: string; authorization_event_id: string; job_id: string; content_sha256: string; approved_at: string }
}
export type PlanInspection = {
  status: 'UNPREPARED' | 'DRAFT' | 'HR_CONFIRMED' | 'STALE' | 'ASSISTANT_REVIEWED'
  current_job_snapshot_sha256: string; content_sha256: string | null; plan: PlanDocument | null
  publishing_blocked: false; candidate_support_verified: false; matching_mode: string
}
export type PlanHistory = {
  revisions: { id: string; jobId: string; revision: number; createdAt: string; document: PlanDocument }[]
  events: { id: string; jobId: string; planId: string; action: 'CREATED' | 'REVISED' | 'CONFIRMED'; createdAt: string }[]
}
const hash = /^[a-f0-9]{64}$/
// Bound response data before it reaches editable state. Never accept a foreign job.
export function parsePlanInspection(value: unknown, jobId: string): PlanInspection {
  const v = value as PlanInspection
  if (!v || !['UNPREPARED', 'DRAFT', 'HR_CONFIRMED', 'STALE', 'ASSISTANT_REVIEWED'].includes(v.status)
    || !hash.test(v.current_job_snapshot_sha256) || v.publishing_blocked !== false
    || v.candidate_support_verified !== false || typeof v.matching_mode !== 'string') throw new Error('Invalid plan response')
  if (v.status === 'UNPREPARED') {
    if (v.plan !== null || v.content_sha256 !== null) throw new Error('Invalid empty plan')
    return v
  }
  const p = v.plan
  if (!p || p.schema_version !== 'jd-fixed-requirements-v1' || p.job_id !== jobId
    || !hash.test(p.job_snapshot_sha256) || !hash.test(v.content_sha256 ?? '')
    || !Number.isInteger(p.revision) || p.revision < 1 || !Array.isArray(p.requirements)
    || p.requirements.length < 1 || p.requirements.length > 64) throw new Error('Invalid plan binding')
  const seen = new Set<string>()
  for (const r of p.requirements) {
    if (!r || typeof r.requirement_id !== 'string' || !r.requirement_id || seen.has(r.requirement_id)
      || typeof r.original_text !== 'string' || !r.original_text || r.original_text.length > 50000
      || typeof r.joint_context_required !== 'boolean' || !Array.isArray(r.components)
      || !r.components.length || r.components.length > 8 || !Array.isArray(r.all_of)
      || !r.all_of.length || r.all_of.length > 8) throw new Error('Invalid plan requirement')
    seen.add(r.requirement_id)
    for (const c of r.components) if (!c || !/^[a-zA-Z0-9_-]{1,64}$/.test(c.id)
      || typeof c.query !== 'string' || !c.query || c.query.length > 5000
      || typeof c.source_quote !== 'string' || !c.source_quote || c.source_quote.length > 5000
      || !['core', 'supplementary', 'preferred', 'unknown'].includes(c.importance)) throw new Error('Invalid plan component')
    const ids = r.components.map(c => c.id)
    if (new Set(ids).size !== ids.length || r.all_of.some(g => !Array.isArray(g) || !g.length || g.length > 8
      || new Set(g).size !== g.length || g.some(id => !ids.includes(id)))
      || ids.some(id => !r.all_of.some(g => g.includes(id)))) throw new Error('Invalid plan groups')
  }
  if (v.status !== 'STALE' && p.job_snapshot_sha256 !== v.current_job_snapshot_sha256) throw new Error('Invalid current snapshot')
  if (v.status === 'HR_CONFIRMED' && (!p.approval || p.approval.origin !== 'authenticated_hr'
    || p.approval.job_id !== jobId || p.approval.content_sha256 !== v.content_sha256)) throw new Error('Invalid confirmation')
  if (v.status === 'DRAFT' && p.approval !== null) throw new Error('Invalid draft approval')
  return v
}
export type PlanValidationIssue = 'source' | 'bounds' | 'query' | 'quote' | 'groups'
export function samePlanSources(a: PlannedRequirement[], b: PlannedRequirement[]) {
  return a.length === b.length && a.every((r, i) => r.requirement_id === b[i].requirement_id && r.original_text === b[i].original_text)
}
export function validatePlanEdits(rows: PlannedRequirement[], original: PlannedRequirement[]): PlanValidationIssue[] {
  const issues = new Set<PlanValidationIssue>()
  if (!samePlanSources(rows, original)) issues.add('source')
  if (!rows.length || rows.length > 64) issues.add('bounds')
  for (const r of rows) {
    if (!r.components.length || r.components.length > 8 || !r.all_of.length || r.all_of.length > 8) issues.add('bounds')
    const ids = r.components.map(c => c.id)
    if (new Set(ids).size !== ids.length || new Set(r.components.map(c => c.query)).size !== ids.length) issues.add('query')
    for (const c of r.components) {
      // HTML, entities, list prefixes and line breaks change Python source_blocks(query).
      // Use a plain single-line query; backend remains authoritative for validation.
      if (!c.query.trim() || c.query !== c.query.trim() || c.query.length > 5000
        || /[\r\n\v\f\u0085\u2028\u2029<>]|&(?:#\d+|#x[\da-f]+|[a-z]+);|^\s*(?:[-*•]|\d+[.)])\s+/i.test(c.query)) issues.add('query')
      if (!c.source_quote.trim() || c.source_quote.length > 5000 || !r.original_text.includes(c.source_quote)) issues.add('quote')
    }
    if (r.all_of.some(g => !g.length || g.length > 8 || new Set(g).size !== g.length || g.some(id => !ids.includes(id)))
      || ids.some(id => !r.all_of.some(g => g.includes(id)))
      || new Set(r.all_of.map(g => [...g].sort().join('|'))).size !== r.all_of.length) issues.add('groups')
  }
  return [...issues]
}
export function removePlanComponent(r: PlannedRequirement, id: string): PlannedRequirement {
  return { ...r, components: r.components.filter(c => c.id !== id), all_of: r.all_of.map(g => g.filter(x => x !== id)).filter(g => g.length) }
}