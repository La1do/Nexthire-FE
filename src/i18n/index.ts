import { common as enCommon } from './locales/en/common'
import { login as enLogin } from './locales/en/pages/login'
import { register as enRegister } from './locales/en/pages/register'
import { common as jaCommon } from './locales/ja/common'
import { login as jaLogin } from './locales/ja/pages/login'
import { register as jaRegister } from './locales/ja/pages/register'
import { common as viCommon } from './locales/vi/common'
import { login as viLogin } from './locales/vi/pages/login'
import { register as viRegister } from './locales/vi/pages/register'
import type { Locale, Translations } from './types'

export const defaultLocale: Locale = 'vi'

export const translations = {
  en: {
    common: enCommon,
    pages: {
      login: enLogin,
      register: enRegister,
    },
  },
  vi: {
    common: viCommon,
    pages: {
      login: viLogin,
      register: viRegister,
    },
  },
  ja: {
    common: jaCommon,
    pages: {
      login: jaLogin,
      register: jaRegister,
    },
  },
} satisfies Record<Locale, Translations>

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale]
}

export type { Locale, Translations }
