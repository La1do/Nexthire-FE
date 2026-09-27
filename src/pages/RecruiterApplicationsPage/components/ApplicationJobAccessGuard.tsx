import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../../i18n'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { Button } from '../../_components'
import { useApplicationJobAccess } from '../hooks/useApplicationJobAccess'
import type { ApplicationJobAccess } from '../types'
import { isForbiddenError, isUnauthorizedError } from '../utils/applicationAccessErrors'
import { APPLICATION_JOBS_PATH } from '../utils/applicationRoutes'
import { ApplicationJobBackLink } from './ApplicationJobBackLink'
import { ApplicationsStatePanel } from './ApplicationsStatePanel'

type ApplicationJobAccessGuardProps = {
  children: (access: ApplicationJobAccess) => ReactNode
  jobId: string
}

/**
 * Data-level access guard for `/recruiter/applications/:jobId`.
 *
 * - Children (CV data) render ONLY when the access query succeeded for the
 *   current `jobId`. Pending, refetch-from-empty, 401 and errors never render
 *   CV data, even if CV lists are still cached by React Query.
 * - 403 (Axios-shaped `response.status === 403`): replace-redirect to the JD list.
 * - 401: left to the shared Axios interceptor / auth context; nothing special.
 * - Anything else: error state with retry, no redirect.
 */
export function ApplicationJobAccessGuard({ children, jobId }: ApplicationJobAccessGuardProps) {
  const navigate = useNavigate()
  const content = useTranslations().pages.recruiterApplications
  const accessQuery = useApplicationJobAccess(jobId)
  const isForbidden = isForbiddenError(accessQuery.error)
  const access = accessQuery.isSuccess && accessQuery.data.jobId === jobId ? accessQuery.data : null

  useEffect(() => {
    if (isForbidden) {
      navigate(APPLICATION_JOBS_PATH, { replace: true })
    }
  }, [isForbidden, navigate])

  if (access) {
    return <>{children(access)}</>
  }

  const isGenericError = accessQuery.isError && !isForbidden && !isUnauthorizedError(accessQuery.error)

  return (
    <div className="recruiter-applications-page recruiter-application-job-page__state">
      <ApplicationJobBackLink label={content.jobDetail.backToList} />
      {isGenericError ? (
        <ApplicationsStatePanel
          action={<Button onClick={() => void accessQuery.refetch()}>{content.jobDetail.retry}</Button>}
          description={getApiErrorEnvelope(accessQuery.error)?.error.message ?? content.jobDetail.errorDescription}
          role="alert"
          title={content.jobDetail.errorTitle}
        />
      ) : (
        <ApplicationsStatePanel title={content.jobDetail.checkingAccess} />
      )}
    </div>
  )
}
