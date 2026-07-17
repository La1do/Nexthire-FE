import { useEffect, useState } from 'react'

export type AsyncState<TData> = {
  data: TData | undefined
  loading: boolean
  error: unknown
}

// Minimal fetch-on-mount hook for read-only page data.
// Re-runs when any dependency in `deps` changes (e.g. active locale).
export function useAsync<TData>(
  fetcher: () => Promise<TData>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<TData> {
  const [state, setState] = useState<AsyncState<TData>>({
    data: undefined,
    loading: true,
    error: undefined,
  })

  // oxlint-disable-next-line react/react-hooks/exhaustive-deps
  useEffect(() => {
    let active = true
    setState({ data: undefined, loading: true, error: undefined })

    fetcher()
      .then((data) => {
        if (active) {
          setState({ data, loading: false, error: undefined })
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ data: undefined, loading: false, error })
        }
      })

    return () => {
      active = false
    }
    // oxlint-disable-next-line react/react-hooks/exhaustive-deps
  }, deps)

  return state
}
