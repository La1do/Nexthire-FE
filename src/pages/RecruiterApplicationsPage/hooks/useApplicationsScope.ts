import { useAuth } from '../../../context'

/**
 * Cache scope for every applications query. Data is member-scoped (Staff sees a
 * subset), so query keys must never be shared between signed-in members.
 */
export function useApplicationsScope() {
  const { user } = useAuth()
  return user?.id ?? 'anonymous'
}
