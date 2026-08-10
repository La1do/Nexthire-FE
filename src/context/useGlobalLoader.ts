import { useContext } from 'react'
import { GlobalLoaderContext } from './globalLoaderContextValue'

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext)

  if (!context) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider')
  }

  return context
}
