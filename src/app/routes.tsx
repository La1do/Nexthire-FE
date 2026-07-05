import type { ReactNode } from 'react'
import { HomePage } from '../pages/HomePage'

export type AppRoute = {
  path: string
  label: string
  element: ReactNode
}

export const routes: AppRoute[] = [
  {
    path: '/',
    label: 'Trang chu',
    element: <HomePage />,
  },
]

export const mainRoute = routes[0]
