import { common as enCommon } from './locales/en/common'
import { adminDashboard as enAdminDashboard } from './locales/en/pages/adminDashboard'
import { adminCompanies as enAdminCompanies } from './locales/en/pages/adminCompanies'
import { adminUsers as enAdminUsers } from './locales/en/pages/adminUsers'
import { candidateSettings as enCandidateSettings } from './locales/en/pages/candidateSettings'
import { comingSoon as enComingSoon } from './locales/en/pages/comingSoon'
import { companyDetail as enCompanyDetail } from './locales/en/pages/companyDetail'
import { forgotPassword as enForgotPassword } from './locales/en/pages/forgotPassword'
import { home as enHome } from './locales/en/pages/home'
import { jobDetail as enJobDetail } from './locales/en/pages/jobDetail'
import { login as enLogin } from './locales/en/pages/login'
import { profile as enProfile } from './locales/en/pages/profile'
import { recruiterApplications as enRecruiterApplications } from './locales/en/pages/recruiterApplications'
import { recruiterCompany as enRecruiterCompany } from './locales/en/pages/recruiterCompany'
import { recruiterHome as enRecruiterHome } from './locales/en/pages/recruiterHome'
import { recruiterJobCreate as enRecruiterJobCreate } from './locales/en/pages/recruiterJobCreate'
import { recruiterJobs as enRecruiterJobs } from './locales/en/pages/recruiterJobs'
import { recruiterSettings as enRecruiterSettings } from './locales/en/pages/recruiterSettings'
import { recruiterVerification as enRecruiterVerification } from './locales/en/pages/recruiterVerification'
import { register as enRegister } from './locales/en/pages/register'
import { search as enSearch } from './locales/en/pages/search'
import { common as jaCommon } from './locales/ja/common'
import { adminDashboard as jaAdminDashboard } from './locales/ja/pages/adminDashboard'
import { adminCompanies as jaAdminCompanies } from './locales/ja/pages/adminCompanies'
import { adminUsers as jaAdminUsers } from './locales/ja/pages/adminUsers'
import { candidateSettings as jaCandidateSettings } from './locales/ja/pages/candidateSettings'
import { comingSoon as jaComingSoon } from './locales/ja/pages/comingSoon'
import { companyDetail as jaCompanyDetail } from './locales/ja/pages/companyDetail'
import { forgotPassword as jaForgotPassword } from './locales/ja/pages/forgotPassword'
import { home as jaHome } from './locales/ja/pages/home'
import { jobDetail as jaJobDetail } from './locales/ja/pages/jobDetail'
import { login as jaLogin } from './locales/ja/pages/login'
import { profile as jaProfile } from './locales/ja/pages/profile'
import { recruiterApplications as jaRecruiterApplications } from './locales/ja/pages/recruiterApplications'
import { recruiterCompany as jaRecruiterCompany } from './locales/ja/pages/recruiterCompany'
import { recruiterHome as jaRecruiterHome } from './locales/ja/pages/recruiterHome'
import { recruiterJobCreate as jaRecruiterJobCreate } from './locales/ja/pages/recruiterJobCreate'
import { recruiterJobs as jaRecruiterJobs } from './locales/ja/pages/recruiterJobs'
import { recruiterSettings as jaRecruiterSettings } from './locales/ja/pages/recruiterSettings'
import { recruiterVerification as jaRecruiterVerification } from './locales/ja/pages/recruiterVerification'
import { register as jaRegister } from './locales/ja/pages/register'
import { search as jaSearch } from './locales/ja/pages/search'
import { common as viCommon } from './locales/vi/common'
import { adminDashboard as viAdminDashboard } from './locales/vi/pages/adminDashboard'
import { adminCompanies as viAdminCompanies } from './locales/vi/pages/adminCompanies'
import { adminUsers as viAdminUsers } from './locales/vi/pages/adminUsers'
import { candidateSettings as viCandidateSettings } from './locales/vi/pages/candidateSettings'
import { comingSoon as viComingSoon } from './locales/vi/pages/comingSoon'
import { companyDetail as viCompanyDetail } from './locales/vi/pages/companyDetail'
import { forgotPassword as viForgotPassword } from './locales/vi/pages/forgotPassword'
import { home as viHome } from './locales/vi/pages/home'
import { jobDetail as viJobDetail } from './locales/vi/pages/jobDetail'
import { login as viLogin } from './locales/vi/pages/login'
import { profile as viProfile } from './locales/vi/pages/profile'
import { recruiterApplications as viRecruiterApplications } from './locales/vi/pages/recruiterApplications'
import { recruiterCompany as viRecruiterCompany } from './locales/vi/pages/recruiterCompany'
import { recruiterHome as viRecruiterHome } from './locales/vi/pages/recruiterHome'
import { recruiterJobCreate as viRecruiterJobCreate } from './locales/vi/pages/recruiterJobCreate'
import { recruiterJobs as viRecruiterJobs } from './locales/vi/pages/recruiterJobs'
import { recruiterSettings as viRecruiterSettings } from './locales/vi/pages/recruiterSettings'
import { recruiterVerification as viRecruiterVerification } from './locales/vi/pages/recruiterVerification'
import { register as viRegister } from './locales/vi/pages/register'
import { search as viSearch } from './locales/vi/pages/search'
import type { Locale, Translations } from './types'

export const defaultLocale: Locale = 'vi'
export const supportedLocales: readonly Locale[] = ['vi', 'en', 'ja']

export const translations = {
  en: {
    common: enCommon,
    pages: {
      adminDashboard: enAdminDashboard,
      adminCompanies: enAdminCompanies,
      adminUsers: enAdminUsers,
      candidateSettings: enCandidateSettings,
      comingSoon: enComingSoon,
      companyDetail: enCompanyDetail,
      forgotPassword: enForgotPassword,
      home: enHome,
      jobDetail: enJobDetail,
      login: enLogin,
      profile: enProfile,
      recruiterApplications: enRecruiterApplications,
      recruiterCompany: enRecruiterCompany,
      recruiterHome: enRecruiterHome,
      recruiterJobCreate: enRecruiterJobCreate,
      recruiterJobs: enRecruiterJobs,
      recruiterSettings: enRecruiterSettings,
      recruiterVerification: enRecruiterVerification,
      register: enRegister,
      search: enSearch,
    },
  },
  vi: {
    common: viCommon,
    pages: {
      adminDashboard: viAdminDashboard,
      adminCompanies: viAdminCompanies,
      adminUsers: viAdminUsers,
      candidateSettings: viCandidateSettings,
      comingSoon: viComingSoon,
      companyDetail: viCompanyDetail,
      forgotPassword: viForgotPassword,
      home: viHome,
      jobDetail: viJobDetail,
      login: viLogin,
      profile: viProfile,
      recruiterApplications: viRecruiterApplications,
      recruiterCompany: viRecruiterCompany,
      recruiterHome: viRecruiterHome,
      recruiterJobCreate: viRecruiterJobCreate,
      recruiterJobs: viRecruiterJobs,
      recruiterSettings: viRecruiterSettings,
      recruiterVerification: viRecruiterVerification,
      register: viRegister,
      search: viSearch,
    },
  },
  ja: {
    common: jaCommon,
    pages: {
      adminDashboard: jaAdminDashboard,
      adminCompanies: jaAdminCompanies,
      adminUsers: jaAdminUsers,
      candidateSettings: jaCandidateSettings,
      comingSoon: jaComingSoon,
      companyDetail: jaCompanyDetail,
      forgotPassword: jaForgotPassword,
      home: jaHome,
      jobDetail: jaJobDetail,
      login: jaLogin,
      profile: jaProfile,
      recruiterApplications: jaRecruiterApplications,
      recruiterCompany: jaRecruiterCompany,
      recruiterHome: jaRecruiterHome,
      recruiterJobCreate: jaRecruiterJobCreate,
      recruiterJobs: jaRecruiterJobs,
      recruiterSettings: jaRecruiterSettings,
      recruiterVerification: jaRecruiterVerification,
      register: jaRegister,
      search: jaSearch,
    },
  },
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale]
}

export function isLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes(value as Locale)
}

export { useLocale } from './useLocale'
export { useTranslations } from './useTranslations'
export type { Locale, Translations }
