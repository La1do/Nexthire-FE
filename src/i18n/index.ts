import { common as enCommon } from './locales/en/common'
import { forgotPassword as enForgotPassword } from './locales/en/pages/forgotPassword'
import { home as enHome } from './locales/en/pages/home'
import { jobDetail as enJobDetail } from './locales/en/pages/jobDetail'
import { login as enLogin } from './locales/en/pages/login'
import { register as enRegister } from './locales/en/pages/register'
import { search as enSearch } from './locales/en/pages/search'
import { common as jaCommon } from './locales/ja/common'
import { forgotPassword as jaForgotPassword } from './locales/ja/pages/forgotPassword'
import { home as jaHome } from './locales/ja/pages/home'
import { jobDetail as jaJobDetail } from './locales/ja/pages/jobDetail'
import { login as jaLogin } from './locales/ja/pages/login'
import { register as jaRegister } from './locales/ja/pages/register'
import { search as jaSearch } from './locales/ja/pages/search'
import { common as viCommon } from './locales/vi/common'
import { forgotPassword as viForgotPassword } from './locales/vi/pages/forgotPassword'
import { home as viHome } from './locales/vi/pages/home'
import { jobDetail as viJobDetail } from './locales/vi/pages/jobDetail'
import { login as viLogin } from './locales/vi/pages/login'
import { register as viRegister } from './locales/vi/pages/register'
import { search as viSearch } from './locales/vi/pages/search'
import type { Locale, Translations } from './types'

export const defaultLocale: Locale = 'vi'

export const translations = {
  en: {
    common: enCommon,
    pages: {
      forgotPassword: enForgotPassword,
      home: enHome,
      jobDetail: enJobDetail,
      login: enLogin,
      register: enRegister,
      search: enSearch,
    },
  },
  vi: {
    common: viCommon,
    pages: {
      forgotPassword: viForgotPassword,
      home: viHome,
      jobDetail: viJobDetail,
      login: viLogin,
      register: viRegister,
      search: viSearch,
    },
  },
  ja: {
    common: jaCommon,
    pages: {
      forgotPassword: jaForgotPassword,
      home: jaHome,
      jobDetail: jaJobDetail,
      login: jaLogin,
      register: jaRegister,
      search: jaSearch,
    },
  },
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale]
}

export type { Locale, Translations }
