import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminAiManagementPage } from '../../pages/AdminAiManagementPage'
import { AuthLayout } from '../../layouts/AuthLayout'
import { BlankLayout } from '../../layouts/BlankLayout'
import { CandidateLayout } from '../../layouts/CandidateLayout'
import { MainLayout } from '../../layouts/MainLayout'
import { RecruiterLayout } from '../../layouts/RecruiterLayout'
import { AdminCompaniesPage } from '../../pages/AdminCompaniesPage'
import { AdminCompanyDetailPage } from '../../pages/AdminCompanyDetailPage'
import { AdminDashboardPage } from '../../pages/AdminDashboardPage'
import { AdminJobsPage } from '../../pages/AdminJobsPage'
import { AdminSettingsPage } from '../../pages/AdminSettingsPage'
import { AdminUsersPage } from '../../pages/AdminUsersPage'
import { AdminUserDetailPage } from '../../pages/AdminUserDetailPage'
import { ComingSoonPage } from '../../pages/ComingSoonPage'
import { CareerGuidePage } from '../../pages/CareerGuidePage'
import { CareerGuideDetailPage } from '../../pages/CareerGuideDetailPage'
import { CompanyDetailPage } from '../../pages/CompanyDetailPage'
import { CvBuilderPage } from '../../pages/CvBuilderPage'
import { CvTemplatesPage } from '../../pages/CvTemplatesPage'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'
import { HomePage } from '../../pages/HomePage'
import { JobDetailPage } from '../../pages/JobDetailPage'
import { AdminLoginPage, CandidateLoginPage, RecruiterLoginPage } from '../../pages/LoginPage'
import { CandidateJobsPage } from '../../pages/CandidateJobsPage'
import { ProfileApplicationsPage } from '../../pages/ProfileApplicationsPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { CandidateSettingsPage } from '../../pages/CandidateSettingsPage'
import { RecruiterApplicationsPage } from '../../pages/RecruiterApplicationsPage'
import { RecruiterCompanyPage } from '../../pages/RecruiterCompanyPage'
import { RecruiterHomePage } from '../../pages/RecruiterHomePage'
import { RecruiterJobCreatePage } from '../../pages/RecruiterJobCreatePage'
import { RecruiterJobDetailPage, RecruiterJobsPage } from '../../pages/RecruiterJobsPage'
import { RecruiterSettingsPage } from '../../pages/RecruiterSettingsPage'
import { RecruiterVerificationPage } from '../../pages/RecruiterVerificationPage'
import { CandidateRegisterPage, RecruiterRegisterPage } from '../../pages/RegisterPage'
import { SearchPage } from '../../pages/SearchPage'
import type { AppRoute } from './routeTypes'
import type { RouteAccess } from './routeTypes'
import type { BusinessGate } from './businessGates'
import type { Translations } from '../../i18n'

const publicAccess: RouteAccess = { kind: 'public' }
const guestOnlyAccess: RouteAccess = { kind: 'guest-only' }

const candidateAccess: RouteAccess = {
  kind: 'protected',
  roles: ['CANDIDATE'],
  loginPath: '/login',
}

const recruiterAccess: RouteAccess = {
  kind: 'protected',
  roles: ['RECRUITER'],
  loginPath: '/recruiter/login',
}

const adminAccess: RouteAccess = {
  kind: 'protected',
  roles: ['ADMIN'],
  loginPath: '/admin/login',
}

const recruiterCompanyRequired: BusinessGate = { kind: 'recruiter-company-required' }
const recruiterCompanyApproved: BusinessGate = { kind: 'recruiter-company-approved' }
const recruiterCanPostJobs: BusinessGate = { kind: 'recruiter-can-post-jobs' }

export function getRoutes({ common, pages }: Translations): AppRoute[] {
  const comingSoon = pages.comingSoon
  return [
    {
      path: '/',
      label: common.navigation.home,
      element: <HomePage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/home',
      label: common.navigation.home,
      element: <HomePage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/search',
      label: pages.search.routeLabel,
      element: <SearchPage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/cv-templates',
      label: pages.cvTemplates.routeLabel,
      element: <CvTemplatesPage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/cv-builder',
      label: 'CV Builder',
      element: <CvBuilderPage />,
      layout: BlankLayout,
      access: publicAccess,
    },
    {
      path: '/cv-builder/:templateId',
      label: 'CV Builder',
      element: <CvBuilderPage />,
      layout: BlankLayout,
      access: publicAccess,
    },
    {
      path: '/jobs/:id',
      label: pages.jobDetail.routeLabel,
      element: <JobDetailPage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/companies',
      label: comingSoon.pages.companies.title,
      element: <ComingSoonPage pageKey="companies" />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/career-guide',
      label: comingSoon.pages.careerGuide.title,
      element: <CareerGuidePage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/career-guide/:slug',
      label: comingSoon.pages.careerGuide.title,
      element: <CareerGuideDetailPage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/companies/:id',
      label: pages.companyDetail.routeLabel,
      element: <CompanyDetailPage />,
      layout: MainLayout,
      access: publicAccess,
    },
    {
      path: '/profile',
      label: pages.profile.routeLabel,
      element: <ProfilePage />,
      layout: CandidateLayout,
      access: candidateAccess,
    },
    {
      path: '/profile/applications',
      label: pages.profile.applications.routeLabel,
      element: <ProfileApplicationsPage />,
      layout: CandidateLayout,
      access: candidateAccess,
    },
    {
      path: '/profile/jobs',
      label: pages.profile.managedJobs.routeLabel,
      element: <CandidateJobsPage />,
      layout: CandidateLayout,
      access: candidateAccess,
    },
    {
      path: '/profile/messages',
      label: comingSoon.pages.profileMessages.title,
      element: <ComingSoonPage pageKey="profileMessages" />,
      layout: CandidateLayout,
      access: candidateAccess,
    },
    {
      path: '/profile/settings',
      label: pages.candidateSettings.routeLabel,
      element: <CandidateSettingsPage />,
      layout: CandidateLayout,
      access: candidateAccess,
    },
    {
      path: '/recruiter',
      label: pages.recruiterHome.routeLabel,
      element: <RecruiterHomePage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
    },
    {
      path: '/recruiter/jobs/new',
      label: pages.recruiterJobCreate.routeLabel,
      element: <RecruiterJobCreatePage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
      businessGate: recruiterCanPostJobs,
    },
    {
      path: '/recruiter/jobs',
      label: pages.recruiterJobs.routeLabel,
      element: <RecruiterJobsPage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
      businessGate: recruiterCompanyRequired,
    },
    {
      path: '/recruiter/jobs/:id/edit',
      label: pages.recruiterJobCreate.routeLabel,
      element: <RecruiterJobCreatePage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
      businessGate: recruiterCanPostJobs,
    },
    {
      path: '/recruiter/jobs/:id',
      label: pages.recruiterJobs.detailRouteLabel,
      element: <RecruiterJobDetailPage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
      businessGate: recruiterCompanyRequired,
    },
    {
      path: '/recruiter/applications',
      label: pages.recruiterApplications.routeLabel,
      element: <RecruiterApplicationsPage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
      businessGate: recruiterCompanyApproved,
    },
    {
      path: '/recruiter/candidates',
      label: comingSoon.pages.recruiterCandidates.title,
      element: <ComingSoonPage pageKey="recruiterCandidates" />,
      layout: RecruiterLayout,
      access: recruiterAccess,
    },
    {
      path: '/recruiter/company',
      label: pages.recruiterCompany.routeLabel,
      element: <RecruiterCompanyPage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
    },
    {
      path: '/recruiter/verification',
      label: pages.recruiterVerification.routeLabel,
      element: <RecruiterVerificationPage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
    },
    {
      path: '/recruiter/messages',
      label: comingSoon.pages.recruiterMessages.title,
      element: <ComingSoonPage pageKey="recruiterMessages" />,
      layout: RecruiterLayout,
      access: recruiterAccess,
    },
    {
      path: '/recruiter/settings',
      label: pages.recruiterSettings.routeLabel,
      element: <RecruiterSettingsPage />,
      layout: RecruiterLayout,
      access: recruiterAccess,
    },
    {
      path: '/login',
      label: common.navigation.login,
      element: <CandidateLoginPage />,
      layout: AuthLayout,
      access: guestOnlyAccess,
    },
    {
      path: '/recruiter/login',
      label: common.navigation.employerCta,
      element: <RecruiterLoginPage />,
      layout: AuthLayout,
      access: guestOnlyAccess,
    },
    {
      path: '/admin/login',
      label: pages.adminUsers.routeLabel,
      element: <AdminLoginPage />,
      layout: AuthLayout,
      access: guestOnlyAccess,
    },
    {
      path: '/register',
      label: pages.register.candidate.routeLabel,
      element: <CandidateRegisterPage />,
      layout: AuthLayout,
      access: guestOnlyAccess,
    },
    {
      path: '/recruiter/register',
      label: pages.register.recruiter.routeLabel,
      element: <RecruiterRegisterPage />,
      layout: AuthLayout,
      access: guestOnlyAccess,
    },
    {
      path: '/forgot-password',
      label: pages.forgotPassword.routeLabel,
      element: <ForgotPasswordPage />,
      layout: AuthLayout,
      access: guestOnlyAccess,
    },
    {
      path: '/admin/dashboard',
      label: pages.adminDashboard.routeLabel,
      element: <AdminDashboardPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/ai-management',
      label: pages.adminAiManagement.routeLabel,
      element: <AdminAiManagementPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/jobs',
      label: pages.adminJobs.routeLabel,
      element: <AdminJobsPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/settings',
      label: pages.adminSettings.routeLabel,
      element: <AdminSettingsPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/users',
      label: pages.adminUsers.routeLabel,
      element: <AdminUsersPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/users/:id',
      label: pages.adminUsers.detail.routeLabel,
      element: <AdminUserDetailPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/companies',
      label: pages.adminCompanies.routeLabel,
      element: <AdminCompaniesPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
    {
      path: '/admin/companies/:id',
      label: pages.adminCompanies.detailRouteLabel,
      element: <AdminCompanyDetailPage />,
      layout: AdminLayout,
      access: adminAccess,
    },
  ]
}
