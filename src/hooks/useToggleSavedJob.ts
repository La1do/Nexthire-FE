import { useCallback, useState } from 'react'
import { getApiErrorEnvelope } from '../lib/api/apiError'
import { savedJobService } from '../services/savedJob.service'
import { useSavedJobsStore } from '../stores/savedJobs.store'

export type ToggleSavedJobResult = {
  isSaved: boolean
  pending: boolean
  errorCode: string | null
  toggle: () => Promise<void>
}

export function useToggleSavedJob(jobId: string): ToggleSavedJobResult {
  const isSaved = useSavedJobsStore((s) => s.savedJobIds.has(jobId))
  const add = useSavedJobsStore((s) => s.add)
  const remove = useSavedJobsStore((s) => s.remove)
  const [pending, setPending] = useState(false)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const toggle = useCallback(async () => {
    if (pending) {
      return
    }

    setPending(true)
    setErrorCode(null)

    try {
      if (isSaved) {
        await savedJobService.remove(jobId)
        remove(jobId)
      } else {
        await savedJobService.save(jobId)
        add(jobId)
      }
    } catch (error) {
      setErrorCode(getApiErrorEnvelope(error)?.error.code ?? 'UNKNOWN')
    } finally {
      setPending(false)
    }
  }, [add, isSaved, jobId, pending, remove])

  return { isSaved, pending, errorCode, toggle }
}
