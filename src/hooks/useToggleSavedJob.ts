import { useCallback, useRef, useState } from 'react'
import { getApiErrorEnvelope } from '../lib/api/apiError'
import { savedJobService } from '../services/savedJob.service'
import { useSavedJobsStore } from '../stores/savedJobs.store'

export type ToggleSavedJobResult = {
  isSaved: boolean
  pending: boolean
  errorCode: string | null
  toggle: () => Promise<boolean>
}

export function useToggleSavedJob(jobId: string): ToggleSavedJobResult {
  const isSaved = useSavedJobsStore((s) => s.savedJobIds.has(jobId))
  const add = useSavedJobsStore((s) => s.add)
  const remove = useSavedJobsStore((s) => s.remove)
  const pendingRef = useRef(false)
  const [pending, setPending] = useState(false)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const toggle = useCallback(async () => {
    if (pendingRef.current) {
      return false
    }

    const wasSaved = isSaved
    pendingRef.current = true
    setPending(true)
    setErrorCode(null)

    if (wasSaved) {
      remove(jobId)
    } else {
      add(jobId)
    }

    try {
      if (wasSaved) {
        await savedJobService.remove(jobId)
        remove(jobId)
      } else {
        await savedJobService.save(jobId)
        add(jobId)
      }
      return true
    } catch (error) {
      if (wasSaved) {
        add(jobId)
      } else {
        remove(jobId)
      }
      setErrorCode(getApiErrorEnvelope(error)?.error.code ?? 'UNKNOWN')
      return false
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }, [add, isSaved, jobId, remove])

  return { isSaved, pending, errorCode, toggle }
}
