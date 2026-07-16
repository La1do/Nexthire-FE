export const login = {
  title: 'Welcome back',
  subtitle: 'Log in to continue with NexHire',
  form: {
    roleLabel: 'Log in as',
    roleOptions: [
      { value: 'candidate', label: 'Candidate' },
      { value: 'employer', label: 'Employer' },
    ],
    emailLabel: 'Email',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submit: 'Log in',
    submitLoading: 'Logging in...',
  },
  footer: {
    prompt: 'No account yet?',
    action: 'Register now',
  },
  validation: {
    emailRequired: 'Please enter your email.',
    emailInvalid: 'Please enter a valid email.',
    passwordRequired: 'Please enter your password.',
  },
}
