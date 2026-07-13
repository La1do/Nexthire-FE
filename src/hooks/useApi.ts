import { useCallback, useEffect, useRef, useState } from 'react'

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseApiOptions<TData, TArgs extends unknown[]> = {
  immediate?: boolean
  initialArgs?: TArgs
  onError?: (error: unknown) => void
  onSuccess?: (data: TData) => void
}

export type UseApiResult<TData, TArgs extends unknown[]> = {
  data: TData | null
  error: unknown
  execute: (...args: TArgs) => Promise<TData>
  isError: boolean
  isIdle: boolean
  isLoading: boolean
  isSuccess: boolean
  reset: () => void
  status: ApiStatus
}

export function useApi<TData, TArgs extends unknown[] = []>(
  apiFunction: (...args: TArgs) => Promise<TData>,
  options: UseApiOptions<TData, TArgs> = {},
): UseApiResult<TData, TArgs> {
  const { immediate = false, initialArgs, onError, onSuccess } = options
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [status, setStatus] = useState<ApiStatus>('idle')
  const requestIdRef = useRef(0)
  const didRunImmediateRef = useRef(false)

  const execute = useCallback(
    async (...args: TArgs) => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      setStatus('loading')
      setError(null)

      try {
        const response = await apiFunction(...args)

        if (requestId === requestIdRef.current) {
          setData(response)
          setStatus('success')
          onSuccess?.(response)
        }

        return response
      } catch (requestError) {
        if (requestId === requestIdRef.current) {
          setError(requestError)
          setStatus('error')
          onError?.(requestError)
        }

        throw requestError
      }
    },
    [apiFunction, onError, onSuccess],
  )

  const reset = useCallback(() => {
    requestIdRef.current += 1
    setData(null)
    setError(null)
    setStatus('idle')
  }, [])

  useEffect(() => {
    if (!immediate || didRunImmediateRef.current) {
      return
    }

    didRunImmediateRef.current = true
    void execute(...((initialArgs ?? []) as TArgs)).catch(() => undefined)
  }, [execute, immediate, initialArgs])

  return {
    data,
    error,
    execute,
    isError: status === 'error',
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    reset,
    status,
  }
}
