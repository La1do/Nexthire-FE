import { Link } from 'react-router-dom'
import { APPLICATION_JOBS_PATH } from '../utils/applicationRoutes'
import './application-job-header.css'

type ApplicationJobBackLinkProps = {
  label: string
}

function BackIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  )
}

export function ApplicationJobBackLink({ label }: ApplicationJobBackLinkProps) {
  return (
    <Link className="recruiter-application-job-back" to={APPLICATION_JOBS_PATH}>
      <BackIcon />
      {label}
    </Link>
  )
}
