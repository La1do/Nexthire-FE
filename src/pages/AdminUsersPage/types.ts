import type {
  AdminUser as AdminApiUser,
  AdminUserRole,
  AdminUserStatus,
} from '../../types/admin.types'

export type { AdminUserRole, AdminUserStatus }

export type AdminUser = AdminApiUser & {
  name: string
  primaryRole: AdminUserRole
}

export type AdminUserAction = 'suspend' | 'ban' | 'archive' | 'restore'
