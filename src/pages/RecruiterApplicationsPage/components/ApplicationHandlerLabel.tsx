import './application-handler-label.css'

type ApplicationHandlerLabelProps = {
  handlerName: string | null
  template: string
}

export function ApplicationHandlerLabel({ handlerName, template }: ApplicationHandlerLabelProps) {
  if (!handlerName) {
    return null
  }

  return (
    <span className="recruiter-application-handler">
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
      {template.replace('{{name}}', handlerName)}
    </span>
  )
}
