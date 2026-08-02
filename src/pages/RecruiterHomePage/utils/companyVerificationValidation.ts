import { z } from 'zod'
import type { RecruiterHomeTranslations } from '../../../i18n/types'

export function createCompanyVerificationSchema(
  validation: RecruiterHomeTranslations['verification']['form']['validation'],
) {
  return z.object({
    address: z.string().refine((value) => value.trim().length > 0, {
      message: validation.addressRequired,
    }),
    description: z.string().refine((value) => value.trim().length > 0, {
      message: validation.descriptionRequired,
    }),
    documents: z.array(z.string()).min(1, {
      message: validation.documentsRequired,
    }),
    logo: z.string(),
    name: z.string().refine((value) => value.trim().length > 0, {
      message: validation.nameRequired,
    }),
    taxCode: z.string()
      .refine((value) => value.trim().length > 0, {
        message: validation.taxCodeRequired,
      })
      .refine((value) => !value.trim() || value.trim().length >= 10, {
        message: validation.taxCodeMinLength,
      }),
    website: z.string()
      .refine((value) => value.trim().length > 0, {
        message: validation.websiteRequired,
      })
      .refine((value) => !value.trim() || /^https?:\/\/\S+\.\S+/.test(value.trim()), {
        message: validation.websiteInvalid,
      }),
  })
}
