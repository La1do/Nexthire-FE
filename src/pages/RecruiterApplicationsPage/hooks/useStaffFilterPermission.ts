import { useCallback } from 'react'
import { useCompanyPlan } from '../../../hooks/useCompanyPlan'
import { usePermission } from '../../../lib/auth/usePermission'

export type StaffFilterPermission = {
  allowed: boolean
  isError: boolean
  isLoading: boolean
  retry: () => void
}

/**
 * "Filter by Staff" is available to members who see every CV (`cv.viewAll`:
 * Manager, FREE Owner). No role comparison: the decision is `can()`'s.
 * Unknown plan (loading / failed) is exposed as-is so the UI shows a loading
 * or error+retry state — never a locked state.
 */
export function useStaffFilterPermission(): StaffFilterPermission {
  const permission = usePermission('cv.viewAll')
  const { refetch } = useCompanyPlan()
  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    allowed: permission.allowed,
    isError: permission.isError,
    isLoading: permission.isLoading,
    retry,
  }
}
