export type AdminUserRole = 'admin' | 'employer' | 'candidate'

export type AdminUserStatus = 'active' | 'locked' | 'invited'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  createdAt: string
  lastActiveAt: string
  company?: string
}

export type AdminUserCriteria = {
  query: string
  role: AdminUserRole | 'all'
  status: AdminUserStatus | 'all'
}

export type AdminUserStats = {
  total: number
  candidates: number
  employers: number
  locked: number
}
