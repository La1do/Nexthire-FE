export type AuthFormRole = 'candidate' | 'employer'

export type AuthApiRole = 'CANDIDATE' | 'RECRUITER'

export function isAuthFormRole(value: string): value is AuthFormRole {
  return value === 'candidate' || value === 'employer'
}

export function toAuthApiRole(role: AuthFormRole): AuthApiRole {
  return role === 'employer' ? 'RECRUITER' : 'CANDIDATE'
}
