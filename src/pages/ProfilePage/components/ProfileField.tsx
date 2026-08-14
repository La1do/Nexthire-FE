import type { ReactNode } from 'react'

type ProfileFieldProps = {
  children: ReactNode
  error?: string
  hint?: string
  hintTone?: 'default' | 'danger'
  label: string
}

export function ProfileField({ children, error, hint, hintTone = 'default', label }: ProfileFieldProps) {
  return (
    <label className="profile-field">
      <span className="profile-field__label">{label}</span>
      <div className="profile-field__control">{children}</div>
      <div className="profile-field__message">
        {error ? (
          <small className="profile-field__error" role="alert">
            {error}
          </small>
        ) : hint ? (
          <small
            className={hintTone === 'danger' ? 'profile-field__hint profile-field__hint--danger' : 'profile-field__hint'}
          >
            {hint}
          </small>
        ) : null}
      </div>
    </label>
  )
}
