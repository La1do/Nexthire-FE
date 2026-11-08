import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { LocaleProvider } from '../../src/i18n/LocaleProvider'
import { apiClient } from '../../src/lib/api'
import { RequirementPlanPanel } from '../../src/pages/RecruiterJobsPage/components/requirement-plan/RequirementPlanPanel'
import { Ai1EvidenceView } from '../../src/pages/RecruiterApplicationsPage/components/ai1/Ai1EvidenceView'
import { ai1Copy } from '../../src/pages/RecruiterApplicationsPage/components/ai1/ai1Copy'
import { hrReviewSchema, type HrReview } from '../../src/types/hr-review.types'

// Disposable test proxy injects synthetic identity server-side. No real tokens in browser.
apiClient.defaults.adapter = async config => {
  const response = await fetch('/__live__' + config.url, {
    method: config.method?.toUpperCase(), headers: { 'Content-Type': 'application/json' },
    body: config.method === 'get' ? undefined : config.data,
  })
  if (!response.ok) throw new Error('Live fixture HTTP failure: ' + response.status)
  return { config, status: response.status, statusText: response.statusText, headers: {}, data: await response.json() }
}
function Harness() {
  const [review, setReview] = useState<HrReview | null>(null)
  const jobId = new URLSearchParams(location.search).get('job')!
  return <><RequirementPlanPanel jobId={jobId} /><button id="run-live-matching" onClick={async () => {
    const response = await fetch('/__run_matching__', { method: 'POST' })
    if (!response.ok) throw new Error('Live worker failed')
    setReview(hrReviewSchema.parse(await response.json()))
  }}>Run synthetic matching</button>
    {review && <Ai1EvidenceView state={{ status: 'loaded', review }} copy={ai1Copy.vi} isMatching={false} onRefresh={() => {}} />}
  </>
}
createRoot(document.getElementById('root')!).render(<LocaleProvider><BrowserRouter><Harness /></BrowserRouter></LocaleProvider>)
