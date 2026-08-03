import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useTranslations } from '../i18n'
import { GlobalLoaderContext } from './globalLoaderContextValue'
import type { GlobalLoaderContextValue, GlobalLoaderMode, GlobalLoaderOptions } from './globalLoaderContextValue'

const DEFAULT_DELAY_MS = 160
const DEFAULT_MIN_VISIBLE_MS = 360

type LoaderEntry = {
  createdAt: number
  delayMs: number
  delayTimer?: number
  label?: GlobalLoaderOptions['label']
  minVisibleMs: number
  mode: GlobalLoaderMode
  visibleSince?: number
}

type LoaderSnapshot = {
  isVisible: boolean
  label?: GlobalLoaderOptions['label']
  mode: GlobalLoaderMode
}

function createLoaderId() {
  return `global-loader-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getVisibleEntries(entries: Map<string, LoaderEntry>) {
  return Array.from(entries.values()).filter((entry) => entry.visibleSince !== undefined)
}

function pickSnapshot(entries: LoaderEntry[], fallbackLabel: GlobalLoaderOptions['label']): LoaderSnapshot {
  const latestEntryWithLabel = [...entries]
    .sort((left, right) => right.createdAt - left.createdAt)
    .find((entry) => entry.label !== undefined)

  return {
    isVisible: true,
    label: latestEntryWithLabel?.label ?? fallbackLabel,
    mode: entries.some((entry) => entry.mode === 'overlay') ? 'overlay' : 'bar',
  }
}

export function GlobalLoaderProvider({ children }: PropsWithChildren) {
  const { common } = useTranslations()
  const activeLoadersRef = useRef(new Map<string, LoaderEntry>())
  const hideTimerRef = useRef<number | undefined>(undefined)
  const visibleSinceRef = useRef<number | null>(null)
  const minVisibleMsRef = useRef(DEFAULT_MIN_VISIBLE_MS)
  const [snapshot, setSnapshot] = useState<LoaderSnapshot>({
    isVisible: false,
    label: undefined,
    mode: 'bar',
  })

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== undefined) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = undefined
    }
  }, [])

  const hideNow = useCallback(() => {
    clearHideTimer()
    visibleSinceRef.current = null
    minVisibleMsRef.current = DEFAULT_MIN_VISIBLE_MS
    setSnapshot({
      isVisible: false,
      label: undefined,
      mode: 'bar',
    })
  }, [clearHideTimer])

  const syncSnapshot = useCallback(() => {
    clearHideTimer()

    const visibleEntries = getVisibleEntries(activeLoadersRef.current)

    if (visibleEntries.length === 0) {
      const visibleSince = visibleSinceRef.current

      if (visibleSince === null) {
        hideNow()
        return
      }

      const remainingMs = minVisibleMsRef.current - (Date.now() - visibleSince)

      if (remainingMs <= 0) {
        hideNow()
        return
      }

      hideTimerRef.current = window.setTimeout(hideNow, remainingMs)
      return
    }

    if (visibleSinceRef.current === null) {
      visibleSinceRef.current = Date.now()
    }

    minVisibleMsRef.current = Math.max(
      minVisibleMsRef.current,
      ...visibleEntries.map((entry) => entry.minVisibleMs),
    )

    setSnapshot(pickSnapshot(visibleEntries, common.loader.defaultLabel))
  }, [clearHideTimer, common.loader.defaultLabel, hideNow])

  const show = useCallback<GlobalLoaderContextValue['show']>(
    (options = {}) => {
      const id = createLoaderId()
      const delayMs = options.delayMs ?? DEFAULT_DELAY_MS
      const entry: LoaderEntry = {
        createdAt: Date.now(),
        delayMs,
        label: options.label,
        minVisibleMs: options.minVisibleMs ?? DEFAULT_MIN_VISIBLE_MS,
        mode: options.mode ?? 'bar',
      }

      activeLoadersRef.current.set(id, entry)

      const reveal = () => {
        const currentEntry = activeLoadersRef.current.get(id)

        if (!currentEntry) {
          return
        }

        currentEntry.delayTimer = undefined
        currentEntry.visibleSince = Date.now()
        syncSnapshot()
      }

      if (delayMs <= 0) {
        reveal()
      } else {
        entry.delayTimer = window.setTimeout(reveal, delayMs)
      }

      return id
    },
    [syncSnapshot],
  )

  const hide = useCallback<GlobalLoaderContextValue['hide']>(
    (id) => {
      const entries = activeLoadersRef.current

      if (id) {
        const entry = entries.get(id)

        if (entry?.delayTimer !== undefined) {
          window.clearTimeout(entry.delayTimer)
        }

        entries.delete(id)
      } else {
        entries.forEach((entry) => {
          if (entry.delayTimer !== undefined) {
            window.clearTimeout(entry.delayTimer)
          }
        })
        entries.clear()
      }

      syncSnapshot()
    },
    [syncSnapshot],
  )

  const track = useCallback<GlobalLoaderContextValue['track']>(
    async (promise, options) => {
      const id = show(options)

      try {
        return await promise
      } finally {
        hide(id)
      }
    },
    [hide, show],
  )

  useEffect(() => {
    const activeLoaders = activeLoadersRef.current

    return () => {
      clearHideTimer()
      activeLoaders.forEach((entry) => {
        if (entry.delayTimer !== undefined) {
          window.clearTimeout(entry.delayTimer)
        }
      })
      activeLoaders.clear()
    }
  }, [clearHideTimer])

  const value = useMemo<GlobalLoaderContextValue>(
    () => ({
      hide,
      isVisible: snapshot.isVisible,
      label: snapshot.label,
      mode: snapshot.mode,
      show,
      track,
    }),
    [hide, show, snapshot.isVisible, snapshot.label, snapshot.mode, track],
  )

  return <GlobalLoaderContext.Provider value={value}>{children}</GlobalLoaderContext.Provider>
}
