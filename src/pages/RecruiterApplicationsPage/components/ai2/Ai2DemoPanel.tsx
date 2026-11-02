import { useEffect, useState } from 'react'
import { useLocale } from '../../../../i18n'
import { applicationService } from '../../../../services/application.service'
import { parseAi2DemoEnvelope, type Ai2DemoScore } from '../../../../types/ai2-demo.types'
import { Ai2DemoView } from './Ai2DemoView'
import { parseAi2Pool, type Ai2Pool } from '../../../../types/ai2-pool.types'

type Props = { applicationId: string; jobId: string; updatedAt: string; isMatching: boolean }
type State = { identity: string; value: Ai2DemoScore | null; pool: Ai2Pool; failed: boolean }

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
    }, 20000)
    const unavailable: Ai2Pool = { status: 'UNAVAILABLE', count: 0, rank: null }
    Promise.all([
      applicationService.getRecruiterApplicationAi2Demo(applicationId, controller.signal)
        .then(payload => parseAi2DemoEnvelope(payload, applicationId, jobId)),
      applicationService.getRecruiterApplicationAi2Pool(applicationId, controller.signal)
        .then(payload => parseAi2Pool(payload, applicationId, jobId)),
    ])
      .then(([value, pool]) => {
        window.clearTimeout(timeout)
        const boundPool = pool.status === 'READY' && (!value || value.status !== 'READY' || pool.resultId !== value.resultId)
          ? unavailable : pool
        if (active) setState({ identity, value, pool: boundPool, failed: false })
      })
      .catch(() => { window.clearTimeout(timeout); if (active) setState({ identity, value: null, pool: unavailable, failed: true }) })
    return () => { active = false; window.clearTimeout(timeout); controller.abort() }
  }, [enabled, identity, applicationId, jobId, isMatching])

  if (!enabled) return null
  const current = state?.identity === identity && !isMatching ? state : null
  return <Ai2DemoView key={identity} locale={locale} loading={!current} failed={current?.failed ?? false} value={current?.value ?? null} pool={current?.pool} />
}
