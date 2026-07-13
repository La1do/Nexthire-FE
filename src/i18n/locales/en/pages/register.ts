export const register = {
  title: 'Create a new account',
  subtitle: 'Start your hiring journey with NexHire',
  form: {
    roleLabel: 'I am',
    roleOptions: [
      { value: 'candidate', label: 'Candidate' },
      { value: 'employer', label: 'Employer' },
    ],
    emailLabel: 'Email',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submit: 'Register',
  },
  footer: {
    prompt: 'Already have an account?',
    action: 'Log in',
  },
  validation: {
    emailRequired: 'Please enter your email.',
    emailInvalid: 'Please enter a valid email.',
    passwordRequired: 'Please enter your password.',
    passwordMinLength: 'Password must be at least 8 characters.',
    confirmPasswordRequired: 'Please confirm your password.',
    passwordMismatch: 'Passwords do not match.',
  },
}
