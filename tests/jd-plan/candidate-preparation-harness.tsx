import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContext } from '../../src/context/authContextValue'
import { apiClient } from '../../src/lib/api'
import { CandidatePreparation } from '../../src/pages/JobDetailPage/components/CandidatePreparation'
import '../../src/styles/index.css'
import '../../src/pages/JobDetailPage/job-detail.css'

const params = new URLSearchParams(location.search)
const fixture = params.get('mode') === 'fixture'
apiClient.defaults.adapter = async config => {
  if (config.url?.endsWith('/preparation') && config.timeout !== 90_000) throw new Error('Preparation must allow the gateway budget')
  const response = await fetch((fixture ? '/__candidate_fixture__' : '/__candidate_live__') + config.url, { method: config.method?.toUpperCase() })
  if (!response.ok) throw new Error('Preparation fixture HTTP ' + response.status)
  return { config, status: response.status, statusText: response.statusText, headers: {}, data: await response.json() }
}
const user = { id: 'synthetic-browser-user', role: params.get('role') ?? 'CANDIDATE' } as import('../../src/services/auth.service').AuthUser
function Harness() {
  const [job, setJob] = useState(params.get('job')!)
  return <AuthContext.Provider value={{ user, isAuthenticated: true,
    isHydratingUser: false, login() {}, logout: async () => {}, refreshUser() {}, updateUser() {} }}>
    {fixture && <button type="button" onClick={() => setJob('job-b')}>Harness: switch job</button>}
    <main className="job-detail-page-wrapper"><div className="job-detail-container"><div className="job-detail-content">
      <CandidatePreparation jobId={job} />
    </div></div></main>
  </AuthContext.Provider>
}
createRoot(document.getElementById('root')!).render(<Harness />)
