type BackToLoginProps = {
  label: string
}

export function BackToLogin({ label }: BackToLoginProps) {
  return (
    <a className="forgot-password-back-link font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href="/login">
      {label}
    </a>
  )
}
