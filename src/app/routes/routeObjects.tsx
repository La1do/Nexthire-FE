import { AdminLayout } from '../../layouts/AdminLayout'
import { AuthLayout } from '../../layouts/AuthLayout'
import { CandidateLayout } from '../../layouts/CandidateLayout'
import { MainLayout } from '../../layouts/MainLayout'
import { RecruiterLayout } from '../../layouts/RecruiterLayout'
import { AdminCompaniesPage } from '../../pages/AdminCompaniesPage'
import { AdminCompanyDetailPage } from '../../pages/AdminCompanyDetailPage'
import { AdminUsersPage } from '../../pages/AdminUsersPage'
import { CompanyDetailPage } from '../../pages/CompanyDetailPage'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'
import { HomePage } from '../../pages/HomePage'
import { JobDetailPage } from '../../pages/JobDetailPage'
import { AdminLoginPage, CandidateLoginPage, RecruiterLoginPage } from '../../pages/LoginPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { RecruiterHomePage } from '../../pages/RecruiterHomePage'
import { CandidateRegisterPage, RecruiterRegisterPage } from '../../pages/RegisterPage'
import { SearchPage } from '../../pages/SearchPage'
import type { AppRoute } from './routeTypes'
import type { Translations } from '../../i18n'

export function getRoutes({ common, pages }: Translations): AppRoute[] {
  return [
    {
      path: '/',
      label: common.navigation.home,
      element: <HomePage />,
      layout: MainLayout,
    },
    {
      path: '/home',
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
      path: '/jobs/:id',
      label: pages.jobDetail.routeLabel,
      element: <JobDetailPage />,
      layout: MainLayout,
    },
    {
      path: '/companies/:id',
      label: pages.companyDetail.routeLabel,
      element: <CompanyDetailPage />,
      layout: MainLayout,
    },
    {
      path: '/profile',
      label: pages.profile.routeLabel,
      element: <ProfilePage />,
      layout: CandidateLayout,
    },
    {
      path: '/recruiter',
      label: pages.recruiterHome.routeLabel,
      element: <RecruiterHomePage />,
      layout: RecruiterLayout,
    },
    {
      path: '/login',
      label: common.navigation.login,
      element: <CandidateLoginPage />,
      layout: AuthLayout,
    },
    {
      path: '/recruiter/login',
      label: common.navigation.employerCta,
      element: <RecruiterLoginPage />,
      layout: AuthLayout,
    },
    {
      path: '/admin/login',
      label: pages.adminUsers.routeLabel,
      element: <AdminLoginPage />,
      layout: AuthLayout,
    },
    {
      path: '/register',
      label: pages.register.candidate.routeLabel,
      element: <CandidateRegisterPage />,
      layout: AuthLayout,
    },
    {
      path: '/recruiter/register',
      label: pages.register.recruiter.routeLabel,
      element: <RecruiterRegisterPage />,
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
}
