import { useState } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type ContactInfoFormProps = {
  content: ProfileTranslations['sections']['contact']
  onChange: (field: 'contactEmail' | 'phone', value: string) => void
  profile: CandidateProfile
  showErrors?: boolean
}

type ContactField = 'contactEmail' | 'phone'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(?:\+84|0)\d{9}$/

export function normalizeContactEmail(value: string) {
  return value.trim()
}

export function normalizePhone(value: string) {
  return value.trim().replace(/[\s.-]/g, '')
}

export function isValidContactEmail(value: string) {
  const normalized = normalizeContactEmail(value)
  return normalized.length > 0 && EMAIL_PATTERN.test(normalized)
}

export function isValidContactPhone(value: string) {
  const normalized = normalizePhone(value)
  return normalized.length > 0 && PHONE_PATTERN.test(normalized)
}

export function ContactInfoForm({ content, onChange, profile, showErrors = false }: ContactInfoFormProps) {
  const [touchedFields, setTouchedFields] = useState<Record<ContactField, boolean>>({
    contactEmail: false,
    phone: false,
  })

  const email = normalizeContactEmail(profile.contactEmail)
  const phone = normalizePhone(profile.phone)
  const shouldValidateEmail = showErrors || touchedFields.contactEmail
  const shouldValidatePhone = showErrors || touchedFields.phone

  const emailError = shouldValidateEmail
    ? !email
      ? content.emailRequired
      : !isValidContactEmail(email)
        ? content.emailInvalid
        : undefined
    : undefined

  const phoneError = shouldValidatePhone
    ? !phone
      ? content.phoneRequired
      : !isValidContactPhone(phone)
        ? content.phoneInvalid
        : undefined
    : undefined

  function markTouched(field: ContactField) {
    setTouchedFields((current) => (current[field] ? current : { ...current, [field]: true }))
  }

  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-form-grid">
        <ProfileField error={emailError} label={content.emailLabel}>
          <input
            aria-invalid={Boolean(emailError)}
            className="profile-control"
            onBlur={() => markTouched('contactEmail')}
            onChange={(event) => onChange('contactEmail', event.target.value)}
            type="email"
            value={profile.contactEmail}
          />
        </ProfileField>
        <ProfileField error={phoneError} label={content.phoneLabel}>
          <input
            aria-invalid={Boolean(phoneError)}
            className="profile-control"
            inputMode="tel"
            onBlur={() => markTouched('phone')}
            onChange={(event) => onChange('phone', event.target.value)}
            type="tel"
            value={profile.phone}
          />
        </ProfileField>
      </div>
    </ProfileSection>
  )
}
