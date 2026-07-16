import type { ComponentType, PropsWithChildren, ReactNode } from 'react'

export type AppRoute = {
  element: ReactNode
  label: string
  layout: ComponentType<PropsWithChildren>
  path: string
}
