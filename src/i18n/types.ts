export type Locale = 'en' | 'vi' | 'ja'

export type CommonTranslations = {
  brandName: string
  navigation: {
    home: string
    login: string
    register: string
  }
}

export type LoginTranslations = {
  title: string
  subtitle: string
  form: {
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    rememberMe: string
    forgotPassword: string
    showPassword: string
    hidePassword: string
    submit: string
  }
  footer: {
    prompt: string
    action: string
  }
  validation: {
    emailRequired: string
    emailInvalid: string
    passwordRequired: string
  }
}

export type RegisterTranslations = {
  title: string
  subtitle: string
  form: {
    roleLabel: string
    roleOptions: ReadonlyArray<{
      value: string
      label: string
    }>
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
    showPassword: string
    hidePassword: string
    submit: string
  }
  footer: {
    prompt: string
    action: string
  }
  validation: {
    emailRequired: string
    emailInvalid: string
    passwordRequired: string
    passwordMinLength: string
    confirmPasswordRequired: string
    passwordMismatch: string
  }
}

export type Translations = {
  common: CommonTranslations
  pages: {
    login: LoginTranslations
    register: RegisterTranslations
  }
}
