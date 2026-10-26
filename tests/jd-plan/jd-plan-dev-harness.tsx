import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { LocaleProvider } from '../../src/i18n/LocaleProvider'
import { apiClient } from '../../src/lib/api'
import { RecruiterJobDetailPage } from '../../src/pages/RecruiterJobsPage'
import type { PlanInspection, PlannedRequirement } from '../../src/types/requirement-plan.types'
import '../../src/styles/index.css'
let mode = 'ready'
let delayed = ''
let revision = 0
const calls: { url?: string; method?: string; data?: any }[] = []
const source = 'Use SQL and AWS or Azure.'
let rows: PlannedRequirement[] = []
const plans = new Map<string, PlanInspection>()
const hash = () => revision.toString(16).padStart(64, '0')
function blank(): PlanInspection { return { status: 'UNPREPARED', current_job_snapshot_sha256: 'a'.repeat(64), content_sha256: null, plan: null, publishing_blocked: false, candidate_support_verified: false, matching_mode: 'unverified' } }
function draft(id: string) {
  revision++
  return { ...blank(), status: 'DRAFT', content_sha256: hash(), plan: { schema_version: 'jd-fixed-requirements-v1', job_id: id, job_snapshot_sha256: 'a'.repeat(64), revision, requirements: structuredClone(rows.length ? rows : [{ requirement_id: 'requirements/0', original_text: source, components: [{ id: 'whole', query: source, source_quote: source, importance: 'unknown' }], all_of: [['whole']], joint_context_required: false }]), approval: null } } as PlanInspection
}
apiClient.defaults.adapter = config => new Promise((resolve, reject) => {
  const url = config.url ?? ''
  const id = url.split('/')[3]
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
  calls.push({ url, method: config.method, data: body })
  let data: any
  let status = 200
  if (url.includes('requirement-plan')) {
    let p = plans.get(id) ?? blank()
    if (mode === 'denied') status = 403
    else if (mode === 'error') status = 503
    else if (mode === 'conflict' && config.method !== 'get') { status = 409; p = draft(id); plans.set(id, p); mode = 'ready' }
    else if (url.endsWith('/history')) data = { revisions: [], events: [] }
    else if (url.endsWith('/drafts')) { p = draft(id); plans.set(id, p) }
    else if (config.method === 'patch') { rows = body.requirements; p = draft(id); plans.set(id, p) }
    else if (url.endsWith('/confirm')) {
      p = structuredClone(p); p.status = 'HR_CONFIRMED'; p.plan!.approval = { origin: 'authenticated_hr', reviewer_id: 'synthetic-hr', authorization_event_id: 'synthetic-event', job_id: id, content_sha256: p.content_sha256!, approved_at: '2026-10-25T00:00:00Z' }; plans.set(id, p)
    }
    if (mode === 'stale') { p = { ...p, status: 'STALE', current_job_snapshot_sha256: 'c'.repeat(64) }; mode = 'ready'; plans.set(id, p) }
    data ??= p
  } else if (url.includes('/applications')) data = { success: true, data: [], meta: { total: 0 } }
  else data = { id, title: `Synthetic ${id}`, status: 'DRAFT', skills: [], requirements: source, description: 'Synthetic job. No personal data.', benefits: '', applicationCount: 0, version: 1, isSalaryVisible: false, createdAt: '2026-10-25T00:00:00Z', updatedAt: '2026-10-25T00:00:00Z' }
  setTimeout(() => {
    const response = { config, status, statusText: String(status), headers: {}, data: url.includes('/applications') ? data : { success: status === 200, data } }
    if (status !== 200) reject(new AxiosError('Synthetic failure', 'ERR_BAD_RESPONSE', config, undefined, response))
    else resolve(response)
  }, delayed && url.includes(delayed) ? 650 : 10)
})
export function Harness() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  ;(window as any).jdHarness = { calls, plans, setMode(value: string) { mode = value }, delay(value: string) { delayed = value }, navigate, rerender() { setTick(tick + 1) }, setRows(value: PlannedRequirement[]) { rows = value } }
  return <><nav><Link to="/recruiter/jobs/synthetic-a">Job A</Link> <Link to="/recruiter/jobs/synthetic-b">Job B</Link></nav><Routes><Route path="/recruiter/jobs/:id" element={<RecruiterJobDetailPage />} /><Route path="*" element={<button onClick={() => navigate('/recruiter/jobs/synthetic-a')}>Start</button>} /></Routes></>
}
createRoot(document.getElementById('root')!).render(<LocaleProvider><BrowserRouter><Harness /></BrowserRouter></LocaleProvider>)