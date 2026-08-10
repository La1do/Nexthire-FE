import { useId, useRef } from 'react'
import {
  formatDisplayDateInput,
  formatDisplayDateToNative,
  formatNativeDateToDisplay,
} from '../utils/jobPostInput'

type JobPostDateInputProps = {
  error?: string
  label: string
  onChange: (value: string) => void
  value: string
}

export function JobPostDateInput({ error, label, onChange, value }: JobPostDateInputProps) {
  const generatedId = useId()
  const nativeInputRef = useRef<HTMLInputElement>(null)
  const errorId = `${generatedId}-error`

  const openCalendar = () => {
    const input = nativeInputRef.current
    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.click()
  }

  return (
    <label className="job-post-field" htmlFor={generatedId}>
      <span>{label}</span>
      <span className="job-post-date-input-shell">
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
        <button
          aria-label={`Chọn ${label.toLowerCase()}`}
          className="job-post-date-picker-button"
          onClick={openCalendar}
          type="button"
        >
          <span aria-hidden="true">▣</span>
        </button>
        <input
          aria-hidden="true"
          className="job-post-native-date-input"
          min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
          onChange={(event) => onChange(formatNativeDateToDisplay(event.target.value))}
          ref={nativeInputRef}
          tabIndex={-1}
          type="date"
          value={formatDisplayDateToNative(value)}
        />
      </span>
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
