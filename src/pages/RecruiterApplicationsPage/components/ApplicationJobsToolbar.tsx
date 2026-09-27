import type { ChangeEvent } from 'react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
import type { StaffFilterPermission } from '../hooks/useStaffFilterPermission'
import type { ApplicationStaffOption } from '../types'
import './application-jobs-toolbar.css'

type ApplicationJobsToolbarProps = {
  canFilterByStaff: boolean
  staffFilterPermission: StaffFilterPermission
  content: RecruiterApplicationsTranslations['jobList']
  hasActiveFilters: boolean
  onClear: () => void
  onQueryChange: (value: string) => void
  onStaffChange: (value: string) => void
  query: string
  staffId: string
  staffMembers: StaffMembersState
}

/** Staff filter options (ACTIVE Staff members) and their load state. */
export type StaffMembersState = {
  isError: boolean
  isLoading: boolean
  options: ReadonlyArray<ApplicationStaffOption>
  retry: () => void
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function ApplicationJobsToolbar({
  canFilterByStaff,
  staffFilterPermission,
  content,
  hasActiveFilters,
  onClear,
  onQueryChange,
  onStaffChange,
  query,
  staffId,
  staffMembers,
}: ApplicationJobsToolbarProps) {
  // Permission-dependent slot: loading -> loading state, error -> message +
  // retry, denied -> nothing. Unknown is never treated as denied/locked.
  const hasStaffSlot = staffFilterPermission.isLoading || staffFilterPermission.isError || canFilterByStaff

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value)
  }

  function renderLoadingSlot() {
    return (
      <div aria-busy="true" className="recruiter-application-jobs-toolbar__slot" role="status">
        <span className="recruiter-application-jobs-toolbar__slot-label">{content.staffLabel}</span>
        <span className="recruiter-application-jobs-toolbar__slot-box">{content.staffFilterLoading}</span>
      </div>
    )
  }

  function renderErrorSlot(message: string, onRetry: () => void) {
    return (
      <div className="recruiter-application-jobs-toolbar__slot" role="alert">
        <span className="recruiter-application-jobs-toolbar__slot-label">{content.staffLabel}</span>
        <span className="recruiter-application-jobs-toolbar__slot-box is-error">
          {message}
          <button onClick={onRetry} type="button">
            {content.staffFilterRetry}
          </button>
        </span>
      </div>
    )
  }

  function renderStaffSlot() {
    if (staffFilterPermission.isLoading) {
      return renderLoadingSlot()
    }

    if (staffFilterPermission.isError) {
      return renderErrorSlot(content.staffFilterError, staffFilterPermission.retry)
    }

    if (!canFilterByStaff) {
      return null
    }

    if (staffMembers.isLoading) {
      return renderLoadingSlot()
    }

    // Members failed to load: hide the select, keep the JD list usable.
    if (staffMembers.isError) {
      return renderErrorSlot(content.staffMembersError, staffMembers.retry)
    }

    return (
      <SelectField
        className="recruiter-applications-filter recruiter-applications-filter--select"
        disabled={staffMembers.options.length === 0}
        label={content.staffLabel}
        onChange={onStaffChange}
        options={[
          { label: content.staffAll, value: 'all' },
          ...staffMembers.options.map((staff) => ({ label: staff.name, value: staff.id })),
        ]}
        value={staffId}
      />
    )
  }

  return (
    <section className="recruiter-applications-filters" aria-label={content.searchLabel}>
      <form
        className={`recruiter-application-jobs-toolbar${hasStaffSlot ? ' has-staff-filter' : ''}`}
        onSubmit={(event) => event.preventDefault()}
        role="search"
      >
        <label className="recruiter-applications-filter recruiter-applications-filter--query">
          <span className="sr-only">{content.searchLabel}</span>
          <span aria-hidden="true" className="recruiter-applications-filter__icon">
            <SearchIcon />
          </span>
          <input
            aria-label={content.searchLabel}
            className="recruiter-applications-filter__input"
            onChange={handleQueryChange}
            placeholder={content.searchPlaceholder}
            type="search"
            value={query}
          />
        </label>

        {renderStaffSlot()}

        <button
          className="recruiter-applications-filter__clear"
          disabled={!hasActiveFilters}
          onClick={onClear}
          type="button"
        >
          {content.clear}
        </button>
      </form>
    </section>
  )
}
