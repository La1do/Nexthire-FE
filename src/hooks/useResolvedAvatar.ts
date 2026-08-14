import { useCallback, useEffect, useMemo, useState } from 'react'

export function useResolvedAvatar(sources: string[]) {
  const sourceKey = sources.join('\n')
  const [failedSources, setFailedSources] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setFailedSources((current) => {
      if (current.size === 0) return current

      const available = new Set(sourceKey ? sourceKey.split('\n') : [])
      const next = new Set([...current].filter((source) => available.has(source)))
      return next.size === current.size ? current : next
    })
  }, [sourceKey])

  const src = useMemo(
    () => sources.find((source) => !failedSources.has(source)) ?? null,
    [failedSources, sourceKey],
  )

  const onError = useCallback((failedSource?: string | null) => {
    const source = failedSource?.trim()
    if (!source) return

    setFailedSources((current) => {
      if (current.has(source)) return current
      const next = new Set(current)
      next.add(source)
      return next
    })
  }, [])

  return { src, onError }
}
