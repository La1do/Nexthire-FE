import { useParams } from 'react-router-dom'
import { ApplicationJobAccessGuard } from './components/ApplicationJobAccessGuard'
import { ApplicationJobsOverview } from './components/ApplicationJobsOverview'
import { ApplicationJobWorkspace } from './components/ApplicationJobWorkspace'
import './recruiter-applications.css'

/** `/recruiter/applications` — tier 1: JD list with CV counts. */
export function RecruiterApplicationsPage() {
  return <ApplicationJobsOverview />
}

/** `/recruiter/applications/:jobId` — tier 2: CVs of one JD, behind a data-level access guard. */
export function RecruiterApplicationJobPage() {
  const { jobId = '' } = useParams<{ jobId: string }>()

  return (
    <ApplicationJobAccessGuard jobId={jobId} key={jobId}>
      {(access) => <ApplicationJobWorkspace access={access} key={access.jobId} />}
    </ApplicationJobAccessGuard>
  )
}

export default RecruiterApplicationsPage
