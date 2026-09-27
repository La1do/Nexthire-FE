import { Link } from 'react-router-dom'
import type { CandidateJobLink } from '../types'
import { getJobApplicationsHref } from '../utils/candidateRoutes'
import './candidate-job-chips.css'

type CandidateJobChipsProps = {
  jobs: ReadonlyArray<CandidateJobLink>
  label: string
  openLabel: string
}

/** Every in-scope JD the candidate applied to; each chip opens that JD's CV page. */
export function CandidateJobChips({ jobs, label, openLabel }: CandidateJobChipsProps) {
  return (
    <ul aria-label={label} className="recruiter-candidate-job-chips">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            aria-label={openLabel.replace('{{title}}', job.jobTitle)}
            className="recruiter-candidate-job-chip"
            title={job.jobTitle}
            to={getJobApplicationsHref(job.jobId)}
          >
            {job.jobTitle}
          </Link>
        </li>
      ))}
    </ul>
  )
}
