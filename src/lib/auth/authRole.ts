export type AuthFormRole = 'candidate' | 'employer'

export type AuthApiRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN'

export type PublicAuthApiRole = Exclude<AuthApiRole, 'ADMIN'>

export function isAuthFormRole(value: string): value is AuthFormRole {
  return value === 'candidate' || value === 'employer'
}

export function toAuthApiRole(role: AuthFormRole): PublicAuthApiRole {
  return role === 'employer' ? 'RECRUITER' : 'CANDIDATE'
}
