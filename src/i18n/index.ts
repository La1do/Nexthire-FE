import { common as enCommon } from './locales/en/common'
import { adminCompanies as enAdminCompanies } from './locales/en/pages/adminCompanies'
import { adminUsers as enAdminUsers } from './locales/en/pages/adminUsers'
import { companyDetail as enCompanyDetail } from './locales/en/pages/companyDetail'
import { forgotPassword as enForgotPassword } from './locales/en/pages/forgotPassword'
import { home as enHome } from './locales/en/pages/home'
import { jobDetail as enJobDetail } from './locales/en/pages/jobDetail'
import { login as enLogin } from './locales/en/pages/login'
import { profile as enProfile } from './locales/en/pages/profile'
import { recruiterHome as enRecruiterHome } from './locales/en/pages/recruiterHome'
import { register as enRegister } from './locales/en/pages/register'
import { search as enSearch } from './locales/en/pages/search'
import { common as jaCommon } from './locales/ja/common'
import { adminCompanies as jaAdminCompanies } from './locales/ja/pages/adminCompanies'
import { adminUsers as jaAdminUsers } from './locales/ja/pages/adminUsers'
import { companyDetail as jaCompanyDetail } from './locales/ja/pages/companyDetail'
import { forgotPassword as jaForgotPassword } from './locales/ja/pages/forgotPassword'
import { home as jaHome } from './locales/ja/pages/home'
import { jobDetail as jaJobDetail } from './locales/ja/pages/jobDetail'
import { login as jaLogin } from './locales/ja/pages/login'
import { profile as jaProfile } from './locales/ja/pages/profile'
import { recruiterHome as jaRecruiterHome } from './locales/ja/pages/recruiterHome'
import { register as jaRegister } from './locales/ja/pages/register'
import { search as jaSearch } from './locales/ja/pages/search'
import { common as viCommon } from './locales/vi/common'
import { adminCompanies as viAdminCompanies } from './locales/vi/pages/adminCompanies'
import { adminUsers as viAdminUsers } from './locales/vi/pages/adminUsers'
import { companyDetail as viCompanyDetail } from './locales/vi/pages/companyDetail'
import { forgotPassword as viForgotPassword } from './locales/vi/pages/forgotPassword'
import { home as viHome } from './locales/vi/pages/home'
import { jobDetail as viJobDetail } from './locales/vi/pages/jobDetail'
import { login as viLogin } from './locales/vi/pages/login'
import { profile as viProfile } from './locales/vi/pages/profile'
import { recruiterHome as viRecruiterHome } from './locales/vi/pages/recruiterHome'
import { register as viRegister } from './locales/vi/pages/register'
import { search as viSearch } from './locales/vi/pages/search'
import type { Locale, Translations } from './types'

export const defaultLocale: Locale = 'vi'

export const translations = {
  en: {
    common: enCommon,
    pages: {
      adminCompanies: enAdminCompanies,
      adminUsers: enAdminUsers,
      companyDetail: enCompanyDetail,
      forgotPassword: enForgotPassword,
      home: enHome,
      jobDetail: enJobDetail,
      login: enLogin,
      profile: enProfile,
      recruiterHome: enRecruiterHome,
      register: enRegister,
      search: enSearch,
    },
  },
  vi: {
    common: viCommon,
    pages: {
      adminCompanies: viAdminCompanies,
      adminUsers: viAdminUsers,
      companyDetail: viCompanyDetail,
      forgotPassword: viForgotPassword,
      home: viHome,
      jobDetail: viJobDetail,
      login: viLogin,
      profile: viProfile,
      recruiterHome: viRecruiterHome,
      register: viRegister,
      search: viSearch,
    },
  },
  ja: {
    common: jaCommon,
    pages: {
      adminCompanies: jaAdminCompanies,
      adminUsers: jaAdminUsers,
      companyDetail: jaCompanyDetail,
      forgotPassword: jaForgotPassword,
      home: jaHome,
      jobDetail: jaJobDetail,
      login: jaLogin,
      profile: jaProfile,
      recruiterHome: jaRecruiterHome,
      register: jaRegister,
      search: jaSearch,
    },
  },
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale]
}

export type { Locale, Translations }
