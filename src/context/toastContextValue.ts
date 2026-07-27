import { createContext } from 'react'
import type { ReactNode } from 'react'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastOptions = {
  action?: ToastAction
  duration?: number
  id?: string
  title?: ReactNode
}

export type ToastInput = ToastOptions & {
  message: ReactNode
  tone?: ToastTone
}

export type ToastContextValue = {
  clearToasts: () => void
  dismissToast: (id: string) => void
  error: (message: ReactNode, options?: ToastOptions) => string
  info: (message: ReactNode, options?: ToastOptions) => string
  showToast: (toast: ToastInput) => string
  success: (message: ReactNode, options?: ToastOptions) => string
  warning: (message: ReactNode, options?: ToastOptions) => string
}

export const ToastContext = createContext<ToastContextValue | null>(null)
