import { z } from 'zod'
import type { RecruiterVerificationTranslations } from '../../i18n/types'
import type { CompanyResponse, UpdateCompanyPayload } from '../../types/company.types'
import type { CompanyLegalFormValues } from './types'

export const EMPTY_COMPANY_FORM: CompanyLegalFormValues = {
  name: '',
  taxCode: '',
  website: '',
  address: '',
  description: '',
}

export function createCompanyLegalSchema(
  validation: RecruiterVerificationTranslations['legal']['validation'],
) {
  return z.object({
    name: z.string().trim().min(1, validation.nameRequired),
    taxCode: z.string()
      .trim()
      .min(1, validation.taxCodeRequired)
      .min(10, validation.taxCodeMinLength),
    website: z.string()
      .trim()
      .min(1, validation.websiteRequired)
      .refine((value) => /^https?:\/\/\S+\.\S+/.test(value), validation.websiteInvalid),
    address: z.string().trim().min(1, validation.addressRequired),
    description: z.string().trim().min(1, validation.descriptionRequired),
  })
}

export function companyToFormValues(company: CompanyResponse | null): CompanyLegalFormValues {
  if (!company) return EMPTY_COMPANY_FORM

  return {
    name: company.name ?? '',
    taxCode: company.taxCode ?? '',
    website: company.website ?? '',
    address: company.address ?? '',
    description: company.description ?? '',
  }
}

export function normalizeCompanyForm(values: CompanyLegalFormValues): CompanyLegalFormValues {
  return {
    name: values.name.trim(),
    taxCode: values.taxCode.trim(),
    website: values.website.trim(),
    address: values.address.trim(),
    description: values.description.trim(),
  }
}

export function buildCompanyUpdatePayload(
  company: CompanyResponse,
  values: CompanyLegalFormValues,
): UpdateCompanyPayload {
  const next = normalizeCompanyForm(values)
  const current = companyToFormValues(company)
  const payload: UpdateCompanyPayload = {}

  for (const key of Object.keys(next) as Array<keyof CompanyLegalFormValues>) {
    if (next[key] !== current[key].trim()) {
      payload[key] = next[key]
    }
  }

  return payload
}
