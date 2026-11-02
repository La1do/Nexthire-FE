import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AxiosError } from 'axios'
import { LocaleProvider } from '../../src/i18n/LocaleProvider'
import { useLocale } from '../../src/i18n'
import { ToastProvider } from '../../src/context'
import { apiClient } from '../../src/lib/api'
import { RecruiterApplicationsPage } from '../../src/pages/RecruiterApplicationsPage'
import '../../src/styles/index.css'

// Synthetic app + real React effects/Axios client. Compress ONLY matching timers.
const nativeTimeout = window.setTimeout.bind(window)
window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => nativeTimeout(handler, timeout === 4000 ? 10 : timeout === 90000 ? 1200 : timeout, ...args)) as typeof window.setTimeout
window.history.replaceState(null, '', '?applicationId=app-005&sort=score-desc')
window.localStorage.setItem('nexhire_locale', 'en')
let mode = 'success', statusReads = 0, detailReads = 0
let posted = false
const calls: { url?: string; method?: string; params?: unknown }[] = []
const app = {
  id: 'app-005', jobId: 'job-005', candidateId: 'candidate-005', candidateCvId: 'cv-005', candidateFullName: 'Synthetic Candidate', candidateEmail: 'synthetic@example.test',
  cvTitle: 'Synthetic CV', cvFileName: 'synthetic.pdf', cvParseStatus: 'PARSED', status: 'SUBMITTED', coverLetter: 'Synthetic cover letter',
  submittedAt: '2026-10-25T00:00:00Z', updatedAt: '2026-10-25T00:00:00Z', jobTitle: 'Synthetic JD', matchScore: 99, matchLevel: 'EXCELLENT', matchSummary: 'LEGACY_FIT_SENTINEL', matchRecommendation: 'GOOD_FIT', matchDecision: 'SHORTLIST', matchMatchedSkills: ['LEGACY_SKILL'],
}
apiClient.defaults.adapter = async config => {
  calls.push({ url: config.url, method: config.method, params: config.params })
  const url = config.url ?? ''
  let data: unknown = null, meta: unknown
  const response = { config, status: 200, statusText: 'OK', headers: {}, data: {} as unknown }
  const fail = (status: number) => { throw new AxiosError('Synthetic failure', 'ERR_BAD_RESPONSE', config, undefined, { ...response, status }) }
  if (url.endsWith('/match')) {
    posted = true
    data = { applicationId: app.id, id: mode.startsWith('parse') ? null : 'new-request', status: mode.startsWith('parse') ? 'WAITING_FOR_CV_PARSE' : mode === 'processing' ? 'PROCESSING' : 'PENDING' }
  } else if (url.endsWith('/matching-status')) {
    statusReads++
    if (mode === 'transient' && statusReads === 1) fail(503)
    if (mode === 'network') fail(503)
    if (mode === 'denied') fail(403)
    data = mode === 'null' ? null : {
      schemaVersion: 'matching-status-v1', applicationId: app.id, jobId: mode === 'foreign' ? 'foreign-job' : app.jobId, candidateId: app.candidateId, candidateCvId: app.candidateCvId,
      resultId: 'result-005', matchRequestId: mode === 'old' || (mode === 'stale-first' && statusReads < 3) ? 'old-request' : 'new-request',
      status: mode === 'failed' ? 'FAILED' : 'SUCCEEDED', createdAt: '2026-10-25T10:00:00Z', scoringStatus: 'NOT_AVAILABLE',
    }
  } else if (url === '/recruiter/applications') {
    data = [app]; meta = { page: 1, total: 1, totalPages: 1, limit: 6 }
  } else if (url === '/recruiter/jobs') {
    data = [{ id: app.jobId, title: app.jobTitle }]; meta = { page: 1, total: 1, totalPages: 1, limit: 100 }
  } else if (url.endsWith('/hr-review')) {
    data = null
  } else if (url === '/recruiter/applications/app-005') {
    if (posted) detailReads++
    data = { ...app, cvParseStatus: mode === 'parse-wait' ? 'PARSING' : mode === 'parse-failed' && posted ? 'FAILED' : mode === 'parse-ready' && (!posted || detailReads < 2) ? 'PARSING' : 'PARSED' }
  } else throw new Error('Unexpected synthetic request: ' + url)
  response.data = { success: true, data, ...(meta ? { meta } : {}) }
  return response
}
export function Harness() {
  const [revision, setRevision] = useState(0)
  const { setLocale } = useLocale()
  Object.assign(window, { baselineHarness: {
    set(next: string) { mode = next; statusReads = 0; detailReads = 0; posted = false; calls.length = 0; setRevision(n => n + 1) },
    locale: setLocale, calls,
  } })
  return <RecruiterApplicationsPage key={revision} />
}
createRoot(document.getElementById('root')!).render(<LocaleProvider><ToastProvider><BrowserRouter><Harness /></BrowserRouter></ToastProvider></LocaleProvider>)
