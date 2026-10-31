import { useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { useLocale } from '../../../../i18n'
import { applicationService } from '../../../../services/application.service'
import { parseHrReviewEnvelope, type HrReview } from '../../../../types/hr-review.types'
import { Ai1EvidenceView, type Ai1ViewState } from './Ai1EvidenceView'
import { ai1Copy } from './ai1Copy'

type Props = {
  applicationId: string
  jobId: string
  isMatching: boolean
  updatedAt: string
  onReviewLoaded?: (review: HrReview | null) => void
}

export function Ai1EvidencePanel({ applicationId, jobId, isMatching, updatedAt, onReviewLoaded }: Props) {
  const { locale } = useLocale()
  const [revision, setRevision] = useState(0)
  const identity = `${applicationId}:${jobId}:${updatedAt}:${isMatching}:${revision}`
  const [result, setResult] = useState<{ identity: string; state: Ai1ViewState } | null>(null)
  const onReviewLoadedRef = useRef(onReviewLoaded)

  useEffect(() => {
    onReviewLoadedRef.current = onReviewLoaded
  }, [onReviewLoaded])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const publish = (state: Ai1ViewState) => { if (active) setResult({ identity, state }) }
    publish({ status: 'loading' })
    applicationService.getRecruiterApplicationHrReview(applicationId, controller.signal)
      .then((payload) => {
        try {
          const review = parseHrReviewEnvelope(payload, applicationId, jobId)
          publish({ status: 'loaded', review })
          if (active) onReviewLoadedRef.current?.(review)
        } catch {
          publish({ status: 'error', kind: 'invalid' })
          if (active) onReviewLoadedRef.current?.(null)
        }
      })
      .catch((error: unknown) => {
        const status = isAxiosError(error) ? error.response?.status : undefined
        publish({ status: 'error', kind: status === 403 || status === 404 ? 'forbidden' : 'error' })
        if (active) onReviewLoadedRef.current?.(null)
      })
    return () => { active = false; controller.abort() }
  }, [applicationId, jobId, identity])

  // Key the result as well as cancelling requests: no old CV flash on a fast switch.
  const state: Ai1ViewState = result?.identity === identity ? result.state : { status: 'loading' }
  return <Ai1EvidenceView state={state} copy={ai1Copy[locale]} isMatching={isMatching} onRefresh={() => setRevision((value) => value + 1)} />
}
