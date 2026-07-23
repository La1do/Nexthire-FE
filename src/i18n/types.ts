export type Locale = 'en' | 'vi' | 'ja'

export type CommonTranslations = {
  brandName: string
  apiErrors: {
    default: string
    byCode: Record<string, string>
  }
  navigation: {
    companies: string
    employerCta: string
    guide: string
    home: string
    jobs: string
    login: string
    register: string
  }
  authUser: {
    profile: string
    logout: string
    menuLabel: string
    candidateRole: string
    recruiterRole: string
    adminRole: string
  }
  languageSwitcher: {
    label: string
    options: Record<Locale, string>
    shortOptions: Record<Locale, string>
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
  job: {
    workingType: {
      ONSITE: string
      REMOTE: string
      HYBRID: string
    }
    salaryNegotiable: string
    jobsCountSuffix: string
    rolesCountSuffix: string
    postedJustNow: string
    postedPrefix: string
    postedSuffix: string
  }
}

export type LoginTranslations = {
  candidate: {
    title: string
    subtitle: string
    switchPrompt: string
    switchAction: string
  }
  recruiter: {
    title: string
    subtitle: string
    switchPrompt: string
    switchAction: string
  }
  admin: {
    title: string
    subtitle: string
    switchPrompt: string
    switchAction: string
  }
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
    submitLoading: string
    orDivider: string
    googleAriaLabel: string
    googleCredentialMissing: string
    googleLoadError: string
    googleLoading: string
    googleUnavailable: string
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
  candidate: {
    routeLabel: string
    title: string
    subtitle: string
    switchPrompt: string
    switchAction: string
    loginPrompt: string
    loginAction: string
    form: RegisterFormCopy
  }
  recruiter: {
    routeLabel: string
    title: string
    subtitle: string
    switchPrompt: string
    switchAction: string
    loginPrompt: string
    loginAction: string
    form: RegisterFormCopy
  }
  verification: {
    sent: {
      title: string
      subtitle: string
    }
    sentSubmit: string
    verify: {
      title: string
      subtitle: string
    }
  }
  validation: {
    emailRequired: string
    emailInvalid: string
    fullNameRequired: string
    fullNameMinLength: string
    phoneRequired: string
    phoneMinLength: string
    passwordRequired: string
    passwordMinLength: string
    confirmPasswordRequired: string
    passwordMismatch: string
  }
}

type RegisterFormCopy = {
  fullNameLabel: string
  fullNamePlaceholder: string
  phoneLabel: string
  phonePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  confirmPasswordLabel: string
  confirmPasswordPlaceholder: string
  showPassword: string
  hidePassword: string
  submit: string
  submitLoading: string
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

export type HomeTranslations = {
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    emptyTitle: string
    emptyDescription: string
  }
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
    stats: {
      openRoles: string
      companies: string
      categories: string
    }
    spotlight: {
      title: string
      subtitle: string
    }
  }
  employers: {
    eyebrow: string
    title: string
    viewAll: string
  }
  jobs: {
    eyebrow: string
    title: string
    tabs: ReadonlyArray<string>
    loadMore: string
    saveLabel: string
  }
  categories: {
    eyebrow: string
    title: string
  }
  industryJobs: {
    eyebrow: string
    title: string
    viewAll: string
    viewMore: string
    saveLabel: string
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
    emailHelper: string
    submit: string
    chips: ReadonlyArray<string>
    mockTitle: string
    mockLines: ReadonlyArray<string>
  }
}

export type SearchTranslations = {
  routeLabel: string
  toolbar: {
    title: string
    description: string
    keywordLabel: string
    keywordPlaceholder: string
    locationLabel: string
    locationPlaceholder: string
    submit: string
  }
  filters: {
    title: string
    description: string
    fieldLabel: string
    locationLabel: string
    salaryLabel: string
    workModeLabel: string
    allOption: string
    clear: string
    apply: string
    salaryOptions: ReadonlyArray<{
      label: string
      value: string
    }>
    workModeOptions: ReadonlyArray<{
      label: string
      value: string
    }>
  }
  results: {
    title: string
    countLabel: string
    emptyQuery: string
    sortLabel: string
    sortOptions: ReadonlyArray<{
      label: string
      value: string
    }>
    saveLabel: string
    verifiedLabel: string
    detailLabel: string
    activeFiltersLabel: string
    loading: string
    errorTitle: string
    errorDescription: string
  }
  empty: {
    title: string
    description: string
    action: string
  }
}

export type AdminUsersTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  sidebar: {
    dashboard: string
    users: string
    jobs: string
    settings: string
    logout: string
  }
  topbar: {
    searchPlaceholder: string
    notificationsLabel: string
    toggleSidebarLabel: string
    profileLabel: string
  }
  stats: {
    totalLabel: string
    candidatesLabel: string
    employersLabel: string
    lockedLabel: string
    totalDelta: string
    candidatesDelta: string
    employersDelta: string
    lockedDelta: string
  }
  filters: {
    queryLabel: string
    queryPlaceholder: string
    roleLabel: string
    statusLabel: string
    roleAll: string
    statusAll: string
    clear: string
  }
  results: {
    caption: string
    countLabel: string
    emptyTitle: string
    emptyDescription: string
    columns: {
      user: string
      role: string
      status: string
      createdAt: string
      lastActiveAt: string
      actions: string
    }
    actionView: string
    actionLock: string
    actionUnlock: string
    actionDelete: string
  }
  pagination: {
    prev: string
    next: string
    pageOf: string
  }
  roles: {
    admin: string
    employer: string
    candidate: string
  }
  statuses: {
    active: string
    locked: string
    invited: string
  }
  currentUser: {
    name: string
    email: string
    role: string
  }
}

export type AdminCompaniesTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  detailRouteLabel: string
  stats: {
    pendingLabel: string
    approvedLabel: string
    rejectedLabel: string
    pendingDelta: string
    approvedDelta: string
    rejectedDelta: string
  }
  filters: {
    queryLabel: string
    queryPlaceholder: string
    statusLabel: string
    statusAll: string
    clear: string
  }
  results: {
    countLabel: string
    emptyTitle: string
    emptyDescription: string
    columns: {
      company: string
      submittedAt: string
      status: string
      actions: string
    }
    actions: {
      viewDetail: string
      approve: string
      reject: string
      verified: string
    }
  }
  pagination: {
    prev: string
    next: string
    pageOf: string
  }
  statuses: {
    pending: string
    approved: string
    rejected: string
  }
  detail: {
    pageTitle: string
    backToList: string
    taxCodeLabel: string
    submittedAtLabel: string
    addressLabel: string
    descriptionTitle: string
    documentsTitle: string
    documentsDescription: string
    download: string
    reviewTitle: string
    pendingHint: string
    approvedHint: string
    rejectedHint: string
    approve: string
    reject: string
    quickStatsTitle: string
    jobPostsLabel: string
    applicantsLabel: string
    responseRateLabel: string
    notFoundEyebrow: string
    notFoundTitle: string
    notFoundDescription: string
  }
}

export type JobDetailTranslations = {
  routeLabel: string
  backToSearch: string
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
  }
  hero: {
    metaLabel: string
    verifiedLabel: string
  }
  sidebar: {
    title: string
    salary: string
    location: string
    workMode: string
    postedAt: string
    deadline: string
    noDeadline: string
    openings: string
    apply: string
    save: string
  }
  sections: {
    description: string
    requirements: string
    benefits: string
  }
  related: {
    title: string
    viewAll: string
    viewDetail: string
  }
  notFound: {
    title: string
    description: string
    action: string
  }
}

export type CompanyDetailProfile = {
  culture: ReadonlyArray<{
    description: string
    title: string
    tone: 'amber' | 'mint' | 'rose'
  }>
  description: string
  founded: string
  heroImage: string
  industry: string
  location: string
  mission: string
  name: string
  perks: ReadonlyArray<string>
  responseTime: string
  size: string
  values: ReadonlyArray<string>
  website: string
}

export type CompanyDetailTranslations = {
  routeLabel: string
  backToSearch: string
  verifiedLabel: string
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
  }
  hero: {
    openJobs: string
    follow: string
    websiteLabel: string
  }
  snapshot: {
    openJobs: string
    size: string
    responseTime: string
    location: string
  }
  sections: {
    about: string
    mission: string
    culture: string
    openJobs: string
    perks: string
    values: string
  }
  sidebar: {
    title: string
    website: string
    industry: string
    founded: string
    size: string
    follow: string
    viewJobs: string
  }
  openJobs: {
    description: string
    emptyTitle: string
    emptyDescription: string
    saveLabel: string
  }
  notFound: {
    title: string
    description: string
    action: string
  }
  fallbackProfile: Omit<CompanyDetailProfile, 'heroImage' | 'name' | 'website'>
  profiles: ReadonlyArray<CompanyDetailProfile>
}

export type ProfileApplicationStatus =
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CANCELLED'

export type ProfileTranslations = {
  routeLabel: string
  pageTitle: string
  sidebar: {
    searchJobs: string
    applications: string
    profile: string
    messages: string
    currentRole: string
  }
  topbar: {
    notificationsLabel: string
    logout: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
    saveError: string
    avatarUploadError: string
    cvUploadError: string
    cvDeleteError: string
    emptyResume: string
  }
  hero: {
    avatarAction: string
    completionLabel: string
    saved: string
    unsaved: string
    save: string
    viewPublic: string
  }
  completion: {
    title: string
    description: string
    items: {
      basic: string
      contact: string
      skills: string
      experience: string
      resume: string
    }
  }
  applications: {
    routeLabel: string
    pageTitle: string
    title: string
    description: string
    primaryAction: string
    stats: {
      total: string
      active: string
      interviews: string
      closed: string
    }
    filters: {
      label: string
      all: string
    }
    statusLabels: Record<ProfileApplicationStatus, string>
    meta: {
      company: string
      location: string
      workingType: string
      salary: string
      cvFile: string
      coverLetter: string
      noCoverLetter: string
      notAvailable: string
      appliedAt: string
      updatedAt: string
    }
    actions: {
      viewJob: string
      withdraw: string
      withdrawing: string
    }
    cvPreview: {
      open: string
      title: string
      subtitle: string
      close: string
      contact: string
      email: string
      phone: string
      location: string
      summary: string
      skills: string
      experience: string
      education: string
      present: string
      loading: string
      error: string
      openExternal: string
    }
    states: {
      loading: string
      errorTitle: string
      errorDescription: string
      retry: string
      withdrawError: string
    }
    empty: {
      title: string
      description: string
      reset: string
    }
    items: ReadonlyArray<{
      id: string
      jobId: string
      jobTitle: string
      companyName: string
      location: string
      workingType: string
      salaryLabel: string
      cvFileName: string
      coverLetter: string
      appliedAt: string
      updatedAt: string
      status: ProfileApplicationStatus
    }>
  }
  sections: {
    basic: {
      title: string
      description: string
      nameLabel: string
      headlineLabel: string
      locationLabel: string
      summaryLabel: string
      summaryCount: string
    }
    contact: {
      title: string
      description: string
      emailLabel: string
      phoneLabel: string
      lockedHint: string
    }
    skills: {
      title: string
      description: string
      inputLabel: string
      inputPlaceholder: string
      add: string
      removeLabel: string
    }
    experience: {
      title: string
      description: string
      add: string
      remove: string
      positionLabel: string
      companyLabel: string
      startLabel: string
      endLabel: string
      currentLabel: string
      descriptionLabel: string
    }
    education: {
      title: string
      description: string
      add: string
      remove: string
      degreeLabel: string
      schoolLabel: string
      startLabel: string
      endLabel: string
    }
    resume: {
      title: string
      description: string
      fileLabel: string
      removeFileLabel: string
      uploadFileLabel: string
      uploadingFileLabel: string
      draftFileApplied: string
      draftFileEmpty: string
      draftFileUnsupported: string
      portfolioLabel: string
      linkedinLabel: string
    }
  }
  profile: {
    name: string
    headline: string
    location: string
    summary: string
    contactEmail: string
    phone: string
    skills: ReadonlyArray<string>
    resumeFile: string
    portfolio: string
    linkedin: string
    experiences: ReadonlyArray<{
      id: string
      company: string
      description: string
      endDate: string
      isCurrent: boolean
      position: string
      startDate: string
    }>
    education: ReadonlyArray<{
      id: string
      degree: string
      endYear: string
      school: string
      startYear: string
    }>
  }
}

export type RecruiterHomeTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  sidebar: {
    overview: string
    jobs: string
    candidates: string
    company: string
    messages: string
    settings: string
    currentRole: string
    logout: string
  }
  topbar: {
    searchPlaceholder: string
    notificationsLabel: string
    toggleSidebarLabel: string
    profileLabel: string
  }
  verification: {
    eyebrow: string
    completionLabel: string
    submittedLabel: string
    rejectionReasonLabel: string
    statusLabels: Record<'NO_COMPANY' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', string>
    statusTitles: Record<'NO_COMPANY' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', string>
    statusDescriptions: Record<'NO_COMPANY' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', string>
    actions: {
      openForm: string
      viewSubmitted: string
      manageProfile: string
      close: string
      submit: string
      submitLoading: string
      cancel: string
    }
    form: {
      title: string
      description: string
      nameLabel: string
      namePlaceholder: string
      taxCodeLabel: string
      taxCodePlaceholder: string
      websiteLabel: string
      websitePlaceholder: string
      addressLabel: string
      addressPlaceholder: string
      logoLabel: string
      logoPlaceholder: string
      descriptionLabel: string
      descriptionPlaceholder: string
      documentsTitle: string
      documentsDescription: string
      submitError: string
      documentOptions: ReadonlyArray<{
        id: string
        label: string
        description: string
      }>
      selectedLabel: string
      validation: {
        nameRequired: string
        taxCodeRequired: string
        taxCodeMinLength: string
        websiteRequired: string
        websiteInvalid: string
        addressRequired: string
        descriptionRequired: string
        documentsRequired: string
      }
    }
  }
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryAction: string
    secondaryAction: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
  }
  stats: {
    title: string
    cards: {
      activeJobs: {
        label: string
        delta: string
      }
      pendingJobs: {
        label: string
        delta: string
      }
      newApplications: {
        label: string
        delta: string
      }
      responseRate: {
        label: string
        delta: string
      }
    }
  }
  quickActions: {
    title: string
    lockedHint: string
  }
  pipeline: {
    title: string
    description: string
    items: {
      draft: string
      pending: string
      active: string
      paused: string
    }
  }
  applications: {
    title: string
    description: string
    viewAll: string
    empty: string
    statusLabels: Record<'SUBMITTED' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED', string>
  }
  performance: {
    title: string
    description: string
    applicationsLabel: string
  }
  tasks: {
    title: string
    description: string
    empty: string
    items: {
      verifyCompany: {
        label: string
        description: string
      }
      pendingJobs: {
        label: string
        description: string
      }
      replyCandidates: {
        label: string
        description: string
      }
    }
  }
}

export type RecruiterJobCreateTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  hero: {
    eyebrow: string
    title: string
    editTitle: string
    description: string
    editDescription: string
    backAction: string
    backToDetail: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    editErrorDescription: string
    editDraftOnly: string
    retry: string
    categoryFallback: string
  }
  gate: {
    loadingTitle: string
    loadingDescription: string
    lockedBadge: string
    noCompanyTitle: string
    noCompanyDescription: string
    pendingTitle: string
    pendingDescription: string
    rejectedTitle: string
    rejectedDescription: string
    suspendedTitle: string
    suspendedDescription: string
    manageCompany: string
    openDashboard: string
  }
  form: {
    sections: {
      basics: {
        title: string
        description: string
      }
      details: {
        title: string
        description: string
      }
      content: {
        title: string
        description: string
      }
    }
    fields: {
      title: {
        label: string
        placeholder: string
      }
      category: {
        label: string
      }
      employmentType: {
        label: string
      }
      workingType: {
        label: string
      }
      experienceLevel: {
        label: string
      }
      location: {
        label: string
        placeholder: string
      }
      salaryMin: {
        label: string
        placeholder: string
      }
      salaryMax: {
        label: string
        placeholder: string
      }
      salaryCurrency: {
        label: string
      }
      isSalaryVisible: {
        label: string
      }
      deadline: {
        label: string
      }
      numberOfOpenings: {
        label: string
        placeholder: string
      }
      skills: {
        label: string
        placeholder: string
        add: string
        removeLabel: string
        empty: string
      }
      description: {
        label: string
        placeholder: string
      }
      requirements: {
        label: string
        placeholder: string
      }
      benefits: {
        label: string
        placeholder: string
      }
    }
    options: {
      noCategory: string
      employmentTypes: Record<'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE', string>
      workingTypes: Record<'ONSITE' | 'REMOTE' | 'HYBRID', string>
      experienceLevels: Record<'INTERN' | 'FRESHER' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD', string>
      currencies: Record<'VND' | 'USD' | 'JPY', string>
    }
    actions: {
      saveDraft: string
      savingDraft: string
      saved: string
      notSavedYet: string
      unsavedChanges: string
      noDraftChanges: string
      submitReview: string
      submittingReview: string
      reset: string
    }
    reviewDialog: {
      title: string
      description: string
      cancel: string
      saveDraft: string
      savingDraft: string
      submitReview: string
      submittingReview: string
    }
    submitError: string
    successDraft: string
    successSubmit: string
    successDescription: string
    viewJobs: string
    createAnother: string
  }
  preview: {
    title: string
    emptyTitle: string
    emptyDescription: string
    labels: {
      category: string
      location: string
      salary: string
      openings: string
      deadline: string
      employmentType: string
      workingType: string
      experienceLevel: string
      skills: string
      description: string
      requirements: string
      benefits: string
      company: string
    }
    salaryHidden: string
    salaryNegotiable: string
    noDeadline: string
    noBenefits: string
    readinessLabel: string
    readinessProgress: string
    checklistTitle: string
    checklistItems: {
      basics: string
      salary: string
      skills: string
      content: string
      deadline: string
    }
  }
  statusLabels: Record<
    | 'DRAFT'
    | 'PENDING_REVIEW'
    | 'NEEDS_REVIEW'
    | 'SHOULD_REJECT'
    | 'PUBLISHED'
    | 'UNPUBLISHED'
    | 'REJECTED'
    | 'CLOSED'
    | 'EXPIRED',
    string
  >
  validation: {
    titleRequired: string
    employmentTypeRequired: string
    workingTypeRequired: string
    experienceLevelRequired: string
    locationRequired: string
    skillsRequired: string
    descriptionRequired: string
    requirementsRequired: string
    salaryMinInvalid: string
    salaryMaxInvalid: string
    salaryRangeInvalid: string
    openingsInvalid: string
    deadlineInvalid: string
  }
}

export type RecruiterJobSortOption = 'latest' | 'deadline_asc' | 'salary_desc' | 'salary_asc'

export type RecruiterJobsTranslations = {
  routeLabel: string
  detailRouteLabel: string
  pageTitle: string
  pageSubtitle: string
  hero: {
    eyebrow: string
    title: string
    description: string
    createAction: string
  }
  summary: {
    label: string
    total: string
    totalDescription: string
    needsAction: string
    needsActionDescription: string
    published: string
    publishedDescription: string
    inactive: string
    inactiveDescription: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
    emptyTitle: string
    emptyDescription: string
    detailLoading: string
    detailErrorTitle: string
    detailErrorDescription: string
  }
  filters: {
    searchLabel: string
    searchPlaceholder: string
    sortLabel: string
    statusLabel: string
    allStatus: string
    apply: string
    clear: string
  }
  table: {
    job: string
    status: string
    applications: string
    deadline: string
    updated: string
    actions: string
  }
  sortOptions: Record<RecruiterJobSortOption, string>
  actions: {
    view: string
    edit: string
    viewPublic: string
    submit: string
    submitting: string
    delete: string
    deleting: string
    unpublish: string
    unpublishing: string
    republish: string
    republishing: string
    close: string
    closing: string
    none: string
    actionError: string
    confirmSubmit: string
    confirmDelete: string
    confirmRepublish: string
    reasonUnpublishPrompt: string
    reasonClosePrompt: string
    backToList: string
  }
  detail: {
    overview: string
    content: string
    moderation: string
    jobId: string
    version: string
    salary: string
    location: string
    openings: string
    employmentType: string
    workingType: string
    experienceLevel: string
    deadline: string
    publishedAt: string
    updatedAt: string
    applications: string
    description: string
    requirements: string
    benefits: string
    noBenefits: string
    skills: string
    adminReason: string
    unpublishReason: string
    noReason: string
    riskScore: string
    riskLevel: string
    moderationDecision: string
    moderationReasons: string
    matchedRules: string
    noModeration: string
    publicLinkUnavailable: string
  }
  metrics: {
    applicationsSuffix: string
    openingsSuffix: string
    noDeadline: string
    salaryHidden: string
    salaryNegotiable: string
    noData: string
    deadlineOverdueAria: string
    deadlineSoonAria: string
  }
}

export type RecruiterApplicationsTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  stats: {
    title: string
    totalLabel: string
    newLabel: string
    interviewLabel: string
    responseRateLabel: string
    totalDelta: string
    newDelta: string
    interviewDelta: string
    responseRateDelta: string
  }
  tabs: {
    label: string
    all: string
  }
  filters: {
    queryLabel: string
    queryPlaceholder: string
    jobLabel: string
    jobAll: string
    sortLabel: string
    sortOptions: {
      newest: string
      scoreDesc: string
      scoreAsc: string
    }
    clear: string
  }
  results: {
    caption: string
    countLabel: string
    emptyTitle: string
    emptyDescription: string
    columns: {
      candidate: string
      job: string
      status: string
      score: string
      submittedAt: string
      actions: string
    }
    actionView: string
    actionEmail: string
    actionDownload: string
  }
  statusLabels: {
    new: string
    screening: string
    interview: string
    offer: string
    hired: string
    rejected: string
  }
  drawer: {
    title: string
    close: string
    statusLabel: string
    candidateTitle: string
    applicationTitle: string
    contactTitle: string
    skillsTitle: string
    coverLetterTitle: string
    activityTitle: string
    emailLabel: string
    phoneLabel: string
    locationLabel: string
    experienceLabel: string
    expectedSalaryLabel: string
    resumeAction: string
    emailAction: string
    portfolioAction: string
    appliedJobLabel: string
    submittedLabel: string
    updatedLabel: string
    scoreLabel: string
  }
  pagination: {
    prev: string
    next: string
    pageOf: string
  }
}

export type Translations = {
  common: CommonTranslations
  pages: {
    adminCompanies: AdminCompaniesTranslations
    adminUsers: AdminUsersTranslations
    comingSoon: ComingSoonTranslations
    companyDetail: CompanyDetailTranslations
    forgotPassword: ForgotPasswordTranslations
    home: HomeTranslations
    jobDetail: JobDetailTranslations
    login: LoginTranslations
    profile: ProfileTranslations
    recruiterApplications: RecruiterApplicationsTranslations
    recruiterJobCreate: RecruiterJobCreateTranslations
    recruiterJobs: RecruiterJobsTranslations
    recruiterHome: RecruiterHomeTranslations
    register: RegisterTranslations
    search: SearchTranslations
  }
}

export type ComingSoonPageKey =
  | 'adminDashboard'
  | 'adminJobs'
  | 'adminSettings'
  | 'careerGuide'
  | 'companies'
  | 'profileMessages'
  | 'recruiterCandidates'
  | 'recruiterCompany'
  | 'recruiterJobs'
  | 'recruiterMessages'
  | 'recruiterSettings'

export type ComingSoonTranslations = {
  badge: string
  title: string
  description: string
  backAction: string
  pages: Record<
    ComingSoonPageKey,
    {
      title: string
      description: string
      backHref: string
      backLabel: string
    }
  >
}
