import { useId } from 'react'
import { formatDisplayDateInput } from '../utils/jobPostInput'

type JobPostDateInputProps = {
  error?: string
  label: string
  onChange: (value: string) => void
  value: string
}

export function JobPostDateInput({ error, label, onChange, value }: JobPostDateInputProps) {
  const generatedId = useId()
  const errorId = `${generatedId}-error`

  return (
    <label className="job-post-field" htmlFor={generatedId}>
      <span>{label}</span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        className="form-control job-post-date-input"
        id={generatedId}
        inputMode="numeric"
        maxLength={10}
        onChange={(event) => onChange(formatDisplayDateInput(event.target.value))}
        pattern="\d{2}/\d{2}/\d{4}"
        placeholder="dd/mm/yyyy"
        type="text"
        value={value}
      />
      <small
        aria-hidden={!error}
        className="job-post-field-error"
        id={error ? errorId : undefined}
        role={error ? 'alert' : undefined}
      >
        {error ?? ' '}
      </small>
    </label>
  )
}
