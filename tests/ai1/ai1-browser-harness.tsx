import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AxiosError } from 'axios'
import { LocaleProvider } from '../../src/i18n/LocaleProvider'
import { apiClient } from '../../src/lib/api'
import { Ai1EvidencePanel } from '../../src/pages/RecruiterApplicationsPage/components/ai1/Ai1EvidencePanel'
import fixtures from './fixtures/ai1-hr-review.synthetic.json'
import '../../src/styles/index.css'
import '../../src/pages/RecruiterApplicationsPage/recruiter-applications.css'
import '../../src/pages/RecruiterApplicationsPage/components/application-detail-drawer.css'

type Mode = 'ready' | 'null' | 'unavailable' | 'disabled' | 'invalid' | 'forbidden' | 'error' | 'slow' | 'warning' | 'overview' | 'plan'
let mode: Mode = 'ready'
let delay = 0
const calls: Array<{ url: string | undefined; method: string | undefined }> = []
const base = structuredClone(fixtures.find((row) => row.scenario === 'CONFIRMED_POSTGRES_AWS')!.review)
apiClient.defaults.adapter = (config) => new Promise((resolve, reject) => {
  const capturedMode = mode
  const capturedDelay = capturedMode === 'slow' ? 600 : delay
  calls.push({ url: config.url, method: config.method })
  const appId = decodeURIComponent(config.url!.split('/')[3])
  const review = structuredClone(base)
  review.applicationId = appId
  review.jobId = 'synthetic-job'
  review.requirements[0].evidence[0].text = `EXACT QUOTE ${appId}\nNo AWS experience. <script>window.injected=true</script>`
  if (capturedMode === 'unavailable' || capturedMode === 'disabled') {
    review.assessmentStatus = capturedMode === 'disabled' ? 'NOT_PERFORMED' : 'UNAVAILABLE'
    review.requirements = []
  }
  if (capturedMode === 'overview') {
    const names = ['Node.js', 'TypeScript', 'REST API', 'PostgreSQL', 'Git', 'Xây dựng REST API với Node.js và TypeScript', 'Thiết kế và truy vấn cơ sở dữ liệu', 'Xác thực và phân quyền', 'Cộng tác nhóm với Git', 'Triển khai dịch vụ trên AWS']
    review.requirements = names.map((text, index) => {
      const q = structuredClone(base.requirements[0]); q.requirementId = `synthetic-req-${index}`; q.text = text
      q.evidence = q.evidence.map((hit, rank) => ({ ...hit, evidenceId: `synthetic-${index}/${rank}`, text: rank === 0 ? `SYNTHETIC QUOTE ${index + 1}. ` + 'Built and maintained API endpoints for a fictional internal service. Reviewed request validation, database queries and access rules with the team. '.repeat(8) : 'TypeScript', reasonCodes: rank === 2 ? ['EXPLICIT_NEGATION_CUE'] : [] }))
      q.evidence[0].source = 'profile'; q.evidence[0].evidenceId = 'profile/summary'
      q.evidence[1].source = 'skill'; q.evidence[2].source = 'project'; q.evidence[2].evidenceId = `uuid-${index}/technologies/0`
      q.evidence[2].similarityScore = 72.5
      q.components = null; q.allOf = null; q.componentAnalysis = 'NOT_PERFORMED'; q.jointContextRequired = false
      return q
    })
  }
  if (capturedMode === 'plan') review.planStatus = 'UNAVAILABLE'
  if (capturedMode === 'invalid') review.applicationId = 'foreign'
  if (capturedMode === 'warning') {
    review.retrievalWarnings = ['M1_CONTEXT_TRUNCATED']
    review.requirements[0].evidence[0].reasonCodes = ['EXPLICIT_NEGATION_CUE']
  }
  setTimeout(() => {
    const response = { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data: capturedMode === 'null' ? null : review } }
    if (capturedMode === 'forbidden' || capturedMode === 'error') {
      response.status = capturedMode === 'forbidden' ? 403 : 503
      reject(new AxiosError('Synthetic error', 'ERR_BAD_RESPONSE', config, undefined, response))
    } else resolve(response)
  }, capturedDelay)
})

export function Harness() {
  const [id, setId] = useState('synthetic-a')
  const [revision, setRevision] = useState(0)
  const [matching, setMatching] = useState(false)
  Object.assign(window, { ai1Harness: {
    set(next: Mode, nextId = id) { mode = next; delay = 0; setId(nextId); setRevision((n) => n + 1) },
    matching(value: boolean) { setMatching(value) }, calls,
  } })
  return <LocaleProvider><main className="recruiter-application-detail-drawer recruiter-application-detail-drawer--hr-review" style={{ position: 'static', marginLeft: 'auto', height: '100dvh' }}><header className="recruiter-application-detail-drawer__header"><div><p className="recruiter-eyebrow">NexHire · Synthetic review</p><h2>Hồ sơ minh họa</h2><p>Frontend review · no personal data</p></div></header><div className="recruiter-application-detail-drawer__body">
    <Ai1EvidencePanel applicationId={id} jobId="synthetic-job" updatedAt={String(revision)} isMatching={matching} />
  </div></main></LocaleProvider>
}
createRoot(document.getElementById('root')!).render(<Harness />)
