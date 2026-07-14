import type { ReactNode } from 'react'

type AdminBadgeTone = 'admin' | 'employer' | 'candidate' | 'active' | 'locked' | 'invited'

type AdminUserBadgeProps = {
  tone: AdminBadgeTone
  children: ReactNode
}

export function AdminUserBadge({ tone, children }: AdminUserBadgeProps) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>
}
