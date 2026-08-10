import { useLocale } from './useLocale'

export function useTranslations() {
  return useLocale().translations
}
