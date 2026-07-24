import { AdminLayout } from '../../layouts/AdminLayout'
import { AuthLayout } from '../../layouts/AuthLayout'
import { CandidateLayout } from '../../layouts/CandidateLayout'
import { MainLayout } from '../../layouts/MainLayout'
import { RecruiterLayout } from '../../layouts/RecruiterLayout'
import { AdminCompaniesPage } from '../../pages/AdminCompaniesPage'
import { AdminCompanyDetailPage } from '../../pages/AdminCompanyDetailPage'
import { AdminUsersPage } from '../../pages/AdminUsersPage'
import { ComingSoonPage } from '../../pages/ComingSoonPage'
import { CareerGuidePage } from '../../pages/CareerGuidePage'
import { CompanyDetailPage } from '../../pages/CompanyDetailPage'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'
import { HomePage } from '../../pages/HomePage'
import { JobDetailPage } from '../../pages/JobDetailPage'
import { AdminLoginPage, CandidateLoginPage, RecruiterLoginPage } from '../../pages/LoginPage'
import { ProfileApplicationsPage } from '../../pages/ProfileApplicationsPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { ProfileSavedJobsPage } from '../../pages/ProfileSavedJobsPage'
import { RecruiterApplicationsPage } from '../../pages/RecruiterApplicationsPage'
import { RecruiterHomePage } from '../../pages/RecruiterHomePage'
import { RecruiterJobCreatePage } from '../../pages/RecruiterJobCreatePage'
import { RecruiterJobDetailPage, RecruiterJobsPage } from '../../pages/RecruiterJobsPage'
import { RecruiterSettingsPage } from '../../pages/RecruiterSettingsPage'
import { CandidateRegisterPage, RecruiterRegisterPage } from '../../pages/RegisterPage'
import { SearchPage } from '../../pages/SearchPage'
import type { AppRoute } from './routeTypes'
import type { Translations } from '../../i18n'

export function getRoutes({ common, pages }: Translations): AppRoute[] {
  const comingSoon = pages.comingSoon
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
      path: '/companies',
      label: comingSoon.pages.companies.title,
      element: <ComingSoonPage pageKey="companies" />,
      layout: MainLayout,
    },
    {
      path: '/career-guide',
      label: comingSoon.pages.careerGuide.title,
      element: <CareerGuidePage />,
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
      path: '/profile/applications',
      label: pages.profile.applications.routeLabel,
      element: <ProfileApplicationsPage />,
      layout: CandidateLayout,
    },
    {
      path: '/profile/saved-jobs',
      label: pages.profile.savedJobs.routeLabel,
      element: <ProfileSavedJobsPage />,
      layout: CandidateLayout,
    },
    {
      path: '/profile/messages',
      label: comingSoon.pages.profileMessages.title,
      element: <ComingSoonPage pageKey="profileMessages" />,
      layout: CandidateLayout,
    },
    {
      path: '/recruiter',
      label: pages.recruiterHome.routeLabel,
      element: <RecruiterHomePage />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/jobs/new',
      label: pages.recruiterJobCreate.routeLabel,
      element: <RecruiterJobCreatePage />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/jobs',
      label: pages.recruiterJobs.routeLabel,
      element: <RecruiterJobsPage />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/jobs/:id/edit',
      label: pages.recruiterJobCreate.routeLabel,
      element: <RecruiterJobCreatePage />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/jobs/:id',
      label: pages.recruiterJobs.detailRouteLabel,
      element: <RecruiterJobDetailPage />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/applications',
      label: pages.recruiterApplications.routeLabel,
      element: <RecruiterApplicationsPage />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/candidates',
      label: comingSoon.pages.recruiterCandidates.title,
      element: <ComingSoonPage pageKey="recruiterCandidates" />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/company',
      label: comingSoon.pages.recruiterCompany.title,
      element: <ComingSoonPage pageKey="recruiterCompany" />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/messages',
      label: comingSoon.pages.recruiterMessages.title,
      element: <ComingSoonPage pageKey="recruiterMessages" />,
      layout: RecruiterLayout,
    },
    {
      path: '/recruiter/settings',
      label: pages.recruiterSettings.routeLabel,
      element: <RecruiterSettingsPage />,
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
      path: '/admin/dashboard',
      label: comingSoon.pages.adminDashboard.title,
      element: <ComingSoonPage pageKey="adminDashboard" />,
      layout: AdminLayout,
    },
    {
      path: '/admin/jobs',
      label: comingSoon.pages.adminJobs.title,
      element: <ComingSoonPage pageKey="adminJobs" />,
      layout: AdminLayout,
    },
    {
      path: '/admin/settings',
      label: comingSoon.pages.adminSettings.title,
      element: <ComingSoonPage pageKey="adminSettings" />,
      layout: AdminLayout,
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
