import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { getTranslations } from '../i18n'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'

export type AppRoute = {
  element: ReactNode
  label: string
  layout: ComponentType<PropsWithChildren>
  path: string
}

const { common, pages } = getTranslations()

export const routes: AppRoute[] = [
  {
    path: '/',
    label: common.navigation.home,
    element: <HomePage />,
    layout: MainLayout,
  },
  {
    path: '/login',
    label: common.navigation.login,
    element: <LoginPage />,
    layout: AuthLayout,
  },
  {
    path: '/register',
    label: common.navigation.register,
    element: <RegisterPage />,
    layout: AuthLayout,
  },
  {
    path: '/forgot-password',
    label: pages.forgotPassword.routeLabel,
    element: <ForgotPasswordPage />,
    layout: AuthLayout,
  },
]

export const mainRoute = routes[0]
