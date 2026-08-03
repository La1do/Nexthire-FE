import { createContext } from 'react'
import type { ReactNode } from 'react'

export type GlobalLoaderMode = 'bar' | 'overlay'

export type GlobalLoaderOptions = {
  delayMs?: number
  label?: ReactNode
  minVisibleMs?: number
  mode?: GlobalLoaderMode
}

export type GlobalLoaderContextValue = {
  hide: (id?: string) => void
  isVisible: boolean
  label?: ReactNode
  mode: GlobalLoaderMode
  show: (options?: GlobalLoaderOptions) => string
  track: <T>(promise: Promise<T>, options?: GlobalLoaderOptions) => Promise<T>
}

export const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(null)
