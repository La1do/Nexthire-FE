import { useEffect } from 'react'
import { savedJobService } from '../services/savedJob.service'
import { useSavedJobsStore } from '../stores/savedJobs.store'

const MAX_IDS_PER_BATCH = 100

function chunk<T>(items: ReadonlyArray<T>, size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

export function useSavedJobsHydrate(jobIds: ReadonlyArray<string>) {
  const hydrate = useSavedJobsStore((s) => s.hydrate)

  useEffect(() => {
    if (jobIds.length === 0) {
      return
    }

    let isActive = true
    const slices = chunk(jobIds, MAX_IDS_PER_BATCH)

    Promise.all(slices.map((slice) => savedJobService.batchStatus(slice)))
      .then((results) => {
        if (!isActive) {
          return
        }
        const merged: string[] = []
        for (const result of results) {
          for (const id of result.savedJobIds) {
            merged.push(id)
          }
        }
        hydrate(merged)
      })
      .catch(() => {
        // Batch status is best-effort; card-level toggle will still hydrate on user interaction.
      })

    return () => {
      isActive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIds.join('|')])
}
