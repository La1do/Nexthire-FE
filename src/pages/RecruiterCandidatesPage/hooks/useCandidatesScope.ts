import { useAuth } from '../../../context'

/** Cache scope: candidate data is member-scoped, never share keys between members. */
export function useCandidatesScope() {
  const { user } = useAuth()
  return user?.id ?? 'anonymous'
}
