import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link } from 'react-router-dom'
import { apiClient } from '../../src/lib/api'
import { AuthContext, type AuthContextValue } from '../../src/context/authContextValue'
import { HrReviewNotebook } from '../../src/pages/RecruiterApplicationsPage/components/HrReviewNotebook'
import '../../src/styles/index.css'
import '../../src/pages/RecruiterApplicationsPage/components/hr-review-notebook.css'
const review = { resultId: '11111111-1111-4111-8111-111111111111', jobSnapshotSha256: 'a'.repeat(64), candidateSnapshotSha256: 'b'.repeat(64), requirements: [{ requirementId: 'r1', text: 'Maintain PostgreSQL backups', evidence: [{ evidenceId: 'e1', text: 'Tested database restores.', source: 'project' }] }] } as unknown as import('../../src/types/hr-review.types').HrReview
let userId = '55555555-5555-4555-8555-555555555555'
let companyId = '77777777-7777-4777-8777-777777777777'
let applicationId = '22222222-2222-4222-8222-222222222222'
apiClient.defaults.adapter = async config => {
  const suffix = config.url?.split('/review-workspace')[1] ?? ''
  const response = await fetch(`/__hr_fixture__${suffix}`, { method: config.method?.toUpperCase(), headers: { 'Content-Type': 'application/json', 'x-test-user-id': userId, 'x-test-company-id': companyId, 'x-test-role': 'RECRUITER' }, body: config.method === 'post' ? config.data : undefined })
  const data = await response.json()
  if (!response.ok) throw { response: { status: response.status } }
  return { config, status: response.status, statusText: response.statusText, headers: {}, data }
}
const root = createRoot(document.getElementById('root')!)
let reviewAvailable = true
function renderHarness() {
  const auth = { user: { id: userId, companyId, role: 'RECRUITER' }, isHydratingUser: false, isAuthenticated: true } as AuthContextValue
  root.render(<AuthContext.Provider value={auth}><BrowserRouter><main><Link to="/leave">Leave workspace</Link><HrReviewNotebook applicationId={applicationId} candidateName="Ứng viên kiểm thử" jobTitle="Backend Developer" review={review} reviewAvailable={reviewAvailable} onLocate={target => { Object.assign(window, { locatedEvidence: target }); document.title = 'PDF located' }} /></main></BrowserRouter></AuthContext.Provider>)
}
Object.assign(window, {
  reviewUnavailable: () => { reviewAvailable = false; renderHarness() },
  changeReviewBinding: () => { review.resultId = '44444444-4444-4444-8444-444444444444'; renderHarness() },
  switchReviewer: (id: string) => { userId = id; renderHarness() },
  switchCompany: (id: string) => { companyId = id; renderHarness() },
  switchApplication: (id: string) => { applicationId = id; renderHarness() },
  unmountNotebook: () => root.unmount(),
})
renderHarness()
