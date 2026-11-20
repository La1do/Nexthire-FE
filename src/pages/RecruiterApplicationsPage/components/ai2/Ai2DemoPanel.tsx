import { useEffect, useState } from 'react'
import { useLocale } from '../../../../i18n'
import { applicationService } from '../../../../services/application.service'
import { parseAi2DemoEnvelope, type Ai2DemoScore } from '../../../../types/ai2-demo.types'
import { Ai2DemoView } from './Ai2DemoView'
import { parseAi2Pool, type Ai2Pool } from '../../../../types/ai2-pool.types'

type Props = { applicationId: string; jobId: string; updatedAt: string; isMatching: boolean }
type State = { identity: string; value: Ai2DemoScore | null; pool: Ai2Pool; failed: boolean }

const AI2_PANEL_TIMEOUT_MS = 30_000

// These explicit failures invalidate an earlier independent score read. Group-size
// and unvalidated-content gates still allow an otherwise valid single-score diagnostic.
const scoreInvalidatingPoolReasons = new Set([
  'M1_NOT_READY', 'CURRENT_PLAN_UNAVAILABLE', 'CURRENT_PLAN_NOT_READY',
  'STALE_PLAN_BINDING', 'STALE_JOB_SNAPSHOT', 'INCOMPATIBLE_PLAN_BINDINGS',
  'INCOMPATIBLE_SNAPSHOTS_OR_DATES', 'INCOMPATIBLE_MODEL', 'INVALID_SCORE',
  'SOURCE_QUERY_V2_FEATURES_NOT_SUPPORTED', 'STORED_INPUT_OR_ASSESSMENT_INCOMPATIBLE',
  'REQUESTED_APPLICATION_NOT_ELIGIBLE', 'CURRENT_CV_NOT_REVALIDATED',
  'CURRENT_CV_CHANGED', 'CURRENT_CV_UNAVAILABLE',
])

export function Ai2DemoPanel({ applicationId, jobId, updatedAt, isMatching }: Props) {
  const { locale } = useLocale()
  const identity = `${applicationId}:${jobId}:${updatedAt}:${isMatching}`
  const [state, setState] = useState<State | null>(null)
  const enabled = import.meta.env.DEV && import.meta.env.VITE_AI2_DEMO_ENABLED === 'true'

  useEffect(() => {
    if (!enabled || isMatching) return
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => {
      if (active) setState({ identity, value: null, pool: { status: 'UNAVAILABLE', count: 0, rank: null }, failed: true })
      active = false
      controller.abort()
    }, AI2_PANEL_TIMEOUT_MS)
    const unavailable: Ai2Pool = { status: 'UNAVAILABLE', count: 0, rank: null }
    Promise.all([
      applicationService.getRecruiterApplicationRankingScore(applicationId, controller.signal)
        .then(payload => parseAi2DemoEnvelope(payload, applicationId, jobId)),
      applicationService.getRecruiterJobApplicationRankings(jobId, controller.signal)
        .then(payload => parseAi2Pool(payload, applicationId, jobId)),
    ])
      .then(([value, pool]) => {
        window.clearTimeout(timeout)
        const bindingMismatch = pool.status === 'READY' && (!value || value.status !== 'READY' || pool.resultId !== value.resultId || pool.modelVersion !== value.modelVersion || pool.referenceDate !== value.referenceDate || pool.jobSnapshotSha256 !== value.jobSnapshotSha256 || pool.inputContract !== value.inputContract || pool.planSchemaVersion !== value.planSchemaVersion || pool.planContentSha256 !== value.planContentSha256)

        const sourceInvalidated = value?.status === 'READY' && pool.status === 'UNAVAILABLE' && scoreInvalidatingPoolReasons.has(pool.reason ?? '')
        const boundPool = bindingMismatch ? { ...unavailable, reason: 'INCOMPATIBLE_PLAN_BINDINGS' } : pool
        if (active) setState({ identity, value: bindingMismatch || sourceInvalidated ? null : value, pool: boundPool, failed: false })
      })
      .catch(() => { window.clearTimeout(timeout); if (active) setState({ identity, value: null, pool: unavailable, failed: true }) })
    return () => { active = false; window.clearTimeout(timeout); controller.abort() }
  }, [enabled, identity, applicationId, jobId, isMatching])

  if (!enabled) return null
  const current = state?.identity === identity && !isMatching ? state : null
  return <Ai2DemoView key={identity} locale={locale} loading={!current} failed={current?.failed ?? false} value={current?.value ?? null} pool={current?.pool} />
}
