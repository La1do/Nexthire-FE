import { AdminShieldIcon, CandidateIcon, RecruiterIcon } from '../../../assets/icons/admin'
import type { AdminUserRole } from '../../../types/admin.types'

type AdminUserRoleBadgeProps = {
  label: string
  role: AdminUserRole
}

const roleIcons = {
  ADMIN: AdminShieldIcon,
  CANDIDATE: CandidateIcon,
  RECRUITER: RecruiterIcon,
} satisfies Record<AdminUserRole, typeof CandidateIcon>

export function AdminUserRoleBadge({ label, role }: AdminUserRoleBadgeProps) {
  const Icon = roleIcons[role]

  return (
    <span className={`admin-user-role-badge is-${role.toLowerCase()}`} title={label}>
      <Icon />
      <span>{label}</span>
    </span>
  )
}
