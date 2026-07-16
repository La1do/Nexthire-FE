import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { CandidateLayout } from '../layouts/CandidateLayout'
import { MainLayout } from '../layouts/MainLayout'
import { getTranslations } from '../i18n'
import { AdminCompaniesPage } from '../pages/AdminCompaniesPage'
import { AdminCompanyDetailPage } from '../pages/AdminCompanyDetailPage'
import { AdminUsersPage } from '../pages/AdminUsersPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HomePage } from '../pages/HomePage'
import { JobDetailPage } from '../pages/JobDetailPage'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { SearchPage } from '../pages/SearchPage'

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
    path: '/search',
    label: pages.search.routeLabel,
    element: <SearchPage />,
    layout: MainLayout,
  },
  {
    path: '/jobs/:slug',
    label: pages.jobDetail.routeLabel,
    element: <JobDetailPage />,
    layout: MainLayout,
  },
  {
    path: '/profile',
    label: pages.profile.routeLabel,
    element: <ProfilePage />,
    layout: CandidateLayout,
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
  {
    path: '/admin/users',
    label: pages.adminUsers.routeLabel,
    element: <AdminUsersPage />,
    layout: AdminLayout,
  },
  {
    path: '/admin/companies',
    label: pages.adminCompanies.routeLabel,
    element: <AdminCompaniesPage />,
    layout: AdminLayout,
  },
  {
    path: '/admin/companies/:id',
    label: pages.adminCompanies.detailRouteLabel,
    element: <AdminCompanyDetailPage />,
    layout: AdminLayout,
  },
]

export const mainRoute = routes[0]
