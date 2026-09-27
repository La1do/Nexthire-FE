import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ApplicationJobListFilters } from '../types'
import { applicationQueryKeys } from '../utils/applicationQueryKeys'
import {
  fetchApplicationJobOptions,
  fetchApplicationJobs,
  fetchStaffFilterOptions,
} from '../utils/applicationsWorkspaceData'
import { useApplicationsScope } from './useApplicationsScope'
import { useStaffFilterPermission } from './useStaffFilterPermission'

/**
 * Tier 1: JDs visible to the current member, with CV counts.
 * `canFilterByStaff` is true only once the permission is known and allowed;
 * `staffFilterPermission` exposes loading/error so the toolbar can render a
 * loading or error+retry state instead of guessing.
 */
export function useApplicationJobs(filters: ApplicationJobListFilters) {
  const scope = useApplicationsScope()
  const staffFilterPermission = useStaffFilterPermission()
  const canFilterByStaff = staffFilterPermission.allowed &&
    !staffFilterPermission.isLoading &&
    !staffFilterPermission.isError
  // An assignee filter from the URL is ignored unless the member may use it.
  const effectiveFilters: ApplicationJobListFilters = canFilterByStaff ? filters : { ...filters, staffId: 'all' }
  const jobsQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchApplicationJobs(effectiveFilters),
    queryKey: applicationQueryKeys.jobs(scope, effectiveFilters),
  })

  // Staff filter options: loaded only for members allowed to filter; its own
  // query so a members failure never breaks the JD list.
  const staffMembersQuery = useQuery({
    enabled: canFilterByStaff,
    queryFn: fetchStaffFilterOptions,
    queryKey: applicationQueryKeys.staffMembers(scope),
    retry: false,
  })

  return { canFilterByStaff, jobsQuery, staffFilterPermission, staffMembersQuery }
}

/** JD options for the tier-2 quick switcher (same scope as the JD list). */
export function useApplicationJobOptions() {
  const scope = useApplicationsScope()

  return useQuery({
    queryFn: fetchApplicationJobOptions,
    queryKey: applicationQueryKeys.jobOptions(scope),
  })
}
