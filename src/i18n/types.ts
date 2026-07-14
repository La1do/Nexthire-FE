export type Locale = 'en' | 'vi' | 'ja'

export type CommonTranslations = {
  brandName: string
  navigation: {
    companies: string
    employerCta: string
    guide: string
    home: string
    jobs: string
    login: string
    register: string
  }
  footer: {
    description: string
    legalLabel: string
    copyright: string
    columns: ReadonlyArray<{
      title: string
      links: ReadonlyArray<string>
    }>
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

export type ForgotPasswordTranslations = {
  routeLabel: string
  backToLogin: string
  steps: {
    request: {
      title: string
      subtitle: string
    }
    sent: {
      title: string
      subtitle: string
    }
    verify: {
      title: string
      subtitle: string
    }
    reset: {
      title: string
      subtitle: string
    }
    success: {
      title: string
      subtitle: string
    }
  }
  form: {
    codeDigitLabel: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    hidePassword: string
    passwordLabel: string
    passwordPlaceholder: string
    requestSubmit: string
    resendPrefix: string
    resendTime: string
    resetSubmit: string
    sentSubmit: string
    showPassword: string
    verifySubmit: string
  }
  validation: {
    codeRequired: string
    confirmPasswordRequired: string
    emailRequired: string
    emailInvalid: string
    passwordRequired: string
    passwordMinLength: string
    passwordMismatch: string
  }
}

export type HomeJobItem = {
  badgeTone: 'blue' | 'pink'
  company: string
  companyLogo: {
    alt: string
    fallbackText: string
    src: string
    tone: 'blue' | 'coral' | 'green' | 'violet'
  }
  description: string
  field: string
  location: string
  postedAt: string
  salary: string
  tags: ReadonlyArray<string>
  title: string
  verified?: boolean
  workMode: string
}

export type HomeCompanyItem = {
  logoAlt: string
  logoSrc: string
  logoText: string
  name: string
  openRoles: string
  tone: 'blue' | 'coral' | 'green' | 'violet'
}

export type HomeTranslations = {
  hero: {
    eyebrow: string
    title: string
    description: string
    keywordLabel: string
    keywordPlaceholder: string
    locationLabel: string
    locationPlaceholder: string
    locationOptions: ReadonlyArray<string>
    filterLabel: string
    submit: string
    quickFilters: ReadonlyArray<string>
    stats: ReadonlyArray<{
      label: string
      value: string
    }>
    spotlight: {
      title: string
      subtitle: string
      items: ReadonlyArray<HomeCompanyItem>
    }
  }
  employers: {
    eyebrow: string
    title: string
    viewAll: string
    items: ReadonlyArray<HomeCompanyItem>
  }
  jobs: {
    eyebrow: string
    title: string
    tabs: ReadonlyArray<string>
    loadMore: string
    saveLabel: string
    items: ReadonlyArray<HomeJobItem>
  }
  categories: {
    eyebrow: string
    title: string
    items: ReadonlyArray<{
      icon: 'all' | 'briefcase' | 'code' | 'data' | 'design' | 'marketing' | 'support'
      title: string
      count: string
    }>
  }
  industryJobs: {
    eyebrow: string
    title: string
    viewAll: string
    viewMore: string
    saveLabel: string
    groups: ReadonlyArray<{
      title: string
      jobs: ReadonlyArray<HomeJobItem>
    }>
  }
  articles: {
    title: string
    readMore: string
    items: ReadonlyArray<{
      category: string
      title: string
      description: string
      tone: 'blue' | 'coral' | 'green'
    }>
  }
  newsletter: {
    eyebrow: string
    title: string
    description: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    chips: ReadonlyArray<string>
    mockTitle: string
    mockLines: ReadonlyArray<string>
  }
}

export type Translations = {
  common: CommonTranslations
  pages: {
    forgotPassword: ForgotPasswordTranslations
    home: HomeTranslations
    login: LoginTranslations
    register: RegisterTranslations
  }
}
