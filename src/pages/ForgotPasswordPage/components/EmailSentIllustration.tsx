export function EmailSentIllustration() {
  return (
    <div className="forgot-password-envelope" aria-hidden="true">
      <svg className="size-28" fill="none" viewBox="0 0 128 104">
        <rect className="forgot-password-envelope-body" height="72" rx="10" width="104" x="12" y="24" />
        <path className="forgot-password-envelope-flap" d="M18 30 64 60l46-30" />
        <path className="forgot-password-envelope-fold" d="M18 90 52 56m58 34L76 56" />
      </svg>
      <span className="forgot-password-envelope-badge">
        <svg className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
    </div>
  )
}
