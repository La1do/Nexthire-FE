export const forgotPassword = {
  routeLabel: 'Forgot password',
  backToLogin: 'Back to log in',
  steps: {
    request: {
      title: 'Forgot password?',
      subtitle: 'Enter your email to receive a password reset code',
    },
    sent: {
      title: 'Email sent',
      subtitle: 'Check the inbox for {{email}} and enter the 6-digit code to reset your password.',
    },
    verify: {
      title: 'Enter verification code',
      subtitle: 'Enter the 6-digit code sent to your email',
    },
    reset: {
      title: 'Set a new password',
      subtitle: 'Your new password must be different from the old one',
    },
    success: {
      title: 'Verification successful!',
      subtitle: 'Redirecting...',
    },
  },
  form: {
    codeDigitLabel: 'Verification digit',
    confirmPasswordLabel: 'Confirm new password',
    confirmPasswordPlaceholder: 'Re-enter password',
    emailLabel: 'Email',
    emailPlaceholder: 'name@company.com',
    hidePassword: 'Hide password',
    passwordLabel: 'New password',
    passwordPlaceholder: 'At least 8 characters',
    requestSubmit: 'Send reset code',
    codeContinueSubmit: 'Continue',
    resendPrefix: 'Resend in',
    resendAction: 'Resend code',
    resendingAction: 'Resending...',
    resetSubmit: 'Save new password',
    sentSubmit: 'Enter verification code',
    showPassword: 'Show password',
    verifySubmit: 'Verify',
  },
  validation: {
    codeRequired: 'Please enter the full 6-digit code.',
    confirmPasswordRequired: 'Please confirm your new password.',
    emailRequired: 'Please enter your email.',
    emailInvalid: 'Please enter a valid email.',
    passwordRequired: 'Please enter a new password.',
    passwordMinLength: 'Password must be at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
  },
}
