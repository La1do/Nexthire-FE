import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren, ReactNode } from 'react'
import { useTranslations } from '../i18n'
import { ToastContext } from './toastContextValue'
import type { ToastAction, ToastContextValue, ToastInput, ToastTone } from './toastContextValue'

type ToastRecord = {
  action?: ToastAction
  createdAt: number
  id: string
  message: ReactNode
  title?: ReactNode
  tone: ToastTone
}

type ToastViewportLabels = {
  closeLabel: string
  regionLabel: string
  statusLabels: Record<ToastTone, string>
}

const DEFAULT_TOAST_DURATION_MS = 4200
const MAX_VISIBLE_TOASTS = 4

const toastIcons: Record<ToastTone, string> = {
  error: '!',
  info: 'i',
  success: '✓',
  warning: '!',
}

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function ToastViewport({
  labels,
  onDismiss,
  toasts,
}: {
  labels: ToastViewportLabels
  onDismiss: (id: string) => void
  toasts: ReadonlyArray<ToastRecord>
}) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <section aria-label={labels.regionLabel} className="toast-viewport" role="region">
      {toasts.map((toast) => (
        <article
          className={`toast toast--${toast.tone}`}
          key={toast.id}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <span aria-hidden="true" className="toast__icon">{toastIcons[toast.tone]}</span>

          <div className="toast__body">
            <strong className="toast__title">{toast.title ?? labels.statusLabels[toast.tone]}</strong>
            <div className="toast__message">{toast.message}</div>
            {toast.action ? (
              <button
                className="toast__action"
                onClick={() => {
                  toast.action?.onClick()
                  onDismiss(toast.id)
                }}
                type="button"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>

          <button
            aria-label={labels.closeLabel}
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            type="button"
          >
            ×
          </button>
        </article>
      ))}
    </section>
  )
}

export function ToastProvider({ children }: PropsWithChildren) {
  const { common } = useTranslations()
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timersRef = useRef(new Map<string, number>())

  const clearToastTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)

    if (timer === undefined) {
      return
    }

    window.clearTimeout(timer)
    timersRef.current.delete(id)
  }, [])

  const dismissToast = useCallback(
    (id: string) => {
      clearToastTimer(id)
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
    },
    [clearToastTimer],
  )

  const clearToasts = useCallback(() => {
    for (const id of Array.from(timersRef.current.keys())) {
      clearToastTimer(id)
    }

    setToasts([])
  }, [clearToastTimer])

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = toast.id ?? createToastId()
      const duration = toast.duration ?? DEFAULT_TOAST_DURATION_MS
      const nextToast: ToastRecord = {
        action: toast.action,
        createdAt: Date.now(),
        id,
        message: toast.message,
        title: toast.title,
        tone: toast.tone ?? 'info',
      }

      clearToastTimer(id)
      setToasts((currentToasts) => [
        nextToast,
        ...currentToasts.filter((currentToast) => currentToast.id !== id),
      ].slice(0, MAX_VISIBLE_TOASTS))

      if (duration > 0) {
        const timer = window.setTimeout(() => dismissToast(id), duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [clearToastTimer, dismissToast],
  )

  useEffect(() => {
    const visibleToastIds = new Set(toasts.map((toast) => toast.id))

    for (const id of Array.from(timersRef.current.keys())) {
      if (!visibleToastIds.has(id)) {
        clearToastTimer(id)
      }
    }
  }, [clearToastTimer, toasts])

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer)
      }

      timersRef.current.clear()
    },
    [],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      clearToasts,
      dismissToast,
      error: (message, options) => showToast({ ...options, message, tone: 'error' }),
      info: (message, options) => showToast({ ...options, message, tone: 'info' }),
      showToast,
      success: (message, options) => showToast({ ...options, message, tone: 'success' }),
      warning: (message, options) => showToast({ ...options, message, tone: 'warning' }),
    }),
    [clearToasts, dismissToast, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport labels={common.toast} onDismiss={dismissToast} toasts={toasts} />
    </ToastContext.Provider>
  )
}
