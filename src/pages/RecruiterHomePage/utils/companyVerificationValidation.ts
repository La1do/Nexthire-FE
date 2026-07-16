import type { FormErrors } from '../../../hooks/useFormState'
import type { CompanyVerificationFormValues } from '../types'
import type { RecruiterHomeTranslations } from '../../../i18n/types'

export function validateCompanyVerificationForm(
  values: CompanyVerificationFormValues,
  validation: RecruiterHomeTranslations['verification']['form']['validation'],
): FormErrors<CompanyVerificationFormValues> {
  const errors: FormErrors<CompanyVerificationFormValues> = {}

  if (!values.name.trim()) {
    errors.name = validation.nameRequired
  }

  if (!values.taxCode.trim()) {
    errors.taxCode = validation.taxCodeRequired
  } else if (values.taxCode.trim().length < 10) {
    errors.taxCode = validation.taxCodeMinLength
  }

  if (!values.website.trim()) {
    errors.website = validation.websiteRequired
  } else if (!/^https?:\/\/\S+\.\S+/.test(values.website.trim())) {
    errors.website = validation.websiteInvalid
  }

  if (!values.address.trim()) {
    errors.address = validation.addressRequired
  }

  if (!values.description.trim()) {
    errors.description = validation.descriptionRequired
  }

  if (values.documents.length === 0) {
    errors.documents = validation.documentsRequired
  }

  return errors
}
