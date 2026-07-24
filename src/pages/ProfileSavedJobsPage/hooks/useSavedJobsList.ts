import { useEffect } from 'react'
import { useAsync } from '../../../hooks/useAsync'
import { savedJobService } from '../../../services/savedJob.service'
import { useSavedJobsStore } from '../../../stores/savedJobs.store'
import type { SavedJobListQuery } from '../../../types/savedJob.types'

export type SavedJobsListData = {
  items: ReturnType<typeof useAsync<SavedJobListQuery>>['data']
  loading: boolean
  error: unknown
  total: number
}

export function useSavedJobsList(query: SavedJobListQuery = { limit: 20, page: 1 }) {
  const queryKey = JSON.stringify(query)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const state = useAsync(() => savedJobService.list(query), [queryKey])

  const hydrate = useSavedJobsStore((s) => s.hydrate)

  useEffect(() => {
    if (!state.data) {
      return
    }
    hydrate(state.data.data.map((item) => item.jobId))
  }, [state.data, hydrate])

  return state
}
