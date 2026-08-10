import type { ReactNode } from 'react'

type ProfileFieldProps = {
  children: ReactNode
  hint?: string
  label: string
}

export function ProfileField({ children, hint, label }: ProfileFieldProps) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}
