import type { CandidateSettingsTranslations } from '../../../types'

export const candidateSettings: CandidateSettingsTranslations = {
  routeLabel: 'Settings',
  pageTitle: 'Account settings',
  pageSubtitle: 'Update the password used to sign in to your candidate account.',
  security: {
    title: 'Change password',
    description: 'Use a password unique to NexHire and avoid reusing an older password.',
    currentPasswordLabel: 'Current password',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submit: 'Change password',
    submitLoading: 'Updating…',
    submitSuccess: 'Your password has been updated.',
    submitError: 'Your password could not be changed. Check your connection and try again.',
    validation: {
      currentRequired: 'Enter your current password.',
      newRequired: 'Enter a new password.',
      confirmRequired: 'Confirm your new password.',
      passwordMinLength: 'Your password must contain at least 8 characters.',
      passwordMaxLength: 'Your password cannot exceed 128 characters.',
      passwordMismatch: 'The confirmation does not match your new password. Enter it again.',
      passwordReuse: 'Your new password must differ from your current password.',
    },
    apiErrors: {
      invalidCredentials: 'Your current password is incorrect. Check it and try again.',
      passwordReuse: 'This password was used before. Choose a different password.',
      credentialMissing: 'This account does not have a password to change. Use your original sign-in method.',
    },
  },
}
