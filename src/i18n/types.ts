export type Locale = 'en' | 'vi' | 'ja'

export type CommonTranslations = {
  brandName: string
  apiErrors: {
    default: string
    byCode: Record<string, string>
  }
  navigation: {
    companies: string
    cvTemplates: string
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
  authFeedback: {
    loginSuccess: string
    googleLoginSuccess: string
    logoutSuccess: string
    registerSuccess: string
    emailVerifiedSuccess: string
    passwordResetEmailSent: string
    passwordResetVerified: string
    passwordResetSuccess: string
  }
  authGuard: {
    authRequiredTitle: string
    authRequiredMessage: string
    roleMismatchTitle: string
    roleMismatchMessage: string
    roleSwitchTitle: string
    roleSwitchMessage: string
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
    supportLabel: string
    supportEmail: string
    columns: ReadonlyArray<{
      title: string
      links: ReadonlyArray<{
        label: string
        href: string
      }>
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
  savedJobs: {
    saving: string
    removing: string
    remove: string
    saveSuccess: string
    removeSuccess: string
    saveError: string
    candidateOnly: string
  }
  toast: {
    regionLabel: string
    closeLabel: string
    statusLabels: Record<'success' | 'error' | 'warning' | 'info', string>
  }
  loader: {
    applyingCvParseLabel: string
    bootLabel: string
    checkingSessionLabel: string
    defaultLabel: string
    deletingCvLabel: string
    googleLoginLabel: string
    loginLabel: string
    logoutLabel: string
    parsingCvLabel: string
    passwordResetRequestLabel: string
    passwordResetSaveLabel: string
    regionLabel: string
    registerLabel: string
    savingProfileLabel: string
    uploadingAvatarLabel: string
    uploadingCvLabel: string
    verifyEmailLabel: string
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
    verify: {
      title: string
      subtitle: string
      codeDigitLabel: string
      resendPrefix: string
      resendAction: string
      resendingAction: string
      verifySubmit: string
      resendSuccessMessage: string
    }
  }
  validation: {
    codeRequired: string
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
    codeContinueSubmit: string
    resendPrefix: string
    resendAction: string
    resendingAction: string
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
      slug: string
      category: string
      title: string
      description: string
      tone: 'blue' | 'coral' | 'green'
      author: string
      authorRole: string
      date: string
      readingTime: string
      content: ReadonlyArray<
        | { type: 'paragraph'; text: string }
        | { type: 'heading'; text: string }
        | { type: 'quote'; text: string; attribution: string }
        | { type: 'list'; items: ReadonlyArray<string> }
      >
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
  promoBanners: ReadonlyArray<{
    id: string
    title: string
    imageAlt: string
    href: string
    viewAll: string
    image: {
      src: string
      width: number
      height: number
    }
  }>
}

export type CompaniesSort = 'mostJobs' | 'latest' | 'name'

export type CompaniesTranslations = {
  routeLabel: string
  hero: {
    title: string
    description: string
    searchLabel: string
    searchPlaceholder: string
    locationLabel: string
    locationAll: string
    workModeLabel: string
    workModeAll: string
    reset: string
  }
  stats: {
    companies: string
    openRoles: string
    remoteFriendly: string
  }
  sort: Record<CompaniesSort, string>
  sections: {
    directoryTitle: string
    directoryDescription: string
    latestJobsTitle: string
    latestJobsDescription: string
  }
  card: {
    verified: string
    openRoles: string
    latestHiring: string
    locations: string
    workModes: string
    rolesPreview: string
    noLocation: string
    noJobs: string
  }
  actions: {
    viewCompany: string
    viewJobs: string
    retry: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    emptyTitle: string
    emptyDescription: string
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
    unsaveLabel: string
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

export type CvTemplatesTranslations = {
  routeLabel: string
  hero: {
    inventoryLabel: string
    title: string
    description: string
    primaryAction: string
    secondaryAction: string
  }
  stats: {
    readyTemplates: string
    categoryGroups: string
    exportReady: string
  }
  filters: {
    label: string
    countLabel: string
    emptyTitle: string
    emptyDescription: string
  }
  categories: Record<'all' | 'it' | 'marketing' | 'sales' | 'hr', string>
  card: {
    readyLabel: string
    categoriesLabel: string
    useTemplate: string
    previewAlt: string
  }
  templateReplaceDialog: {
    title: string
    description: string
    templateLabel: string
    cancel: string
    confirm: string
  }
  notes: {
    title: string
    items: ReadonlyArray<string>
  }
  upcoming: {
    title: string
    description: string
    badge: string
    items: ReadonlyArray<{
      name: string
      description: string
      category: string
    }>
  }
}

export type AdminCvTemplatesTranslations = {
  routeLabel: string
  pageTitle: string
  sidebarLabel: string
  pageSubtitle: string
  stats: {
    total: string
    published: string
    draft: string
    archived: string
  }
  filters: {
    searchLabel: string
    searchPlaceholder: string
    statusLabel: string
    statusAll: string
    categoryLabel: string
    categoryAll: string
    clear: string
    refresh: string
    create: string
  }
  table: {
    countLabel: string
    emptyTitle: string
    emptyDescription: string
    columns: {
      template: string
      key: string
      categories: string
      status: string
      version: string
      sortOrder: string
      updatedAt: string
      actions: string
    }
  }
  form: {
    createTitle: string
    editTitle: string
    keyLabel: string
    keyPlaceholder: string
    keyHint: string
    defaultNameLabel: string
    defaultDescriptionLabel: string
    nameGroup: string
    descriptionGroup: string
    localeLabels: Record<Locale, string>
    optionalLocaleHint: string
    categoryLabel: string
    accentLabel: string
    thumbnailUrlLabel: string
    thumbnailUploadLabel: string
    thumbnailSelected: string
    thumbnailFileHint: string
    thumbnailFileError: string
    sortOrderLabel: string
    canvasJsonLabel: string
    canvasJsonHint: string
    formatJson: string
    validateJson: string
    save: string
    saving: string
    cancel: string
    loading: string
    requiredFields: string
    categoriesRequired: string
    canvasRequired: string
    invalidJson: string
    validJson: string
    formattedJson: string
    createSuccess: string
    updateSuccess: string
    saveError: string
    actionError: string
  }
  aiImport: {
    title: string
    description: string
    uploadLabel: string
    analyzing: string
    elementsKept: string
    dropped: string
    clamped: string
    bindings: string
    piiScrubbed: string
    parsedTitle: string
    parsedSummary: string
    pageOf: string
    apply: string
    retry: string
    overwriteTitle: string
    overwriteDescription: string
    applied: string
    failed: string
    uploadFailed: string
    errors: Record<string, string>
  }
  actions: {
    edit: string
    publish: string
    archive: string
    restore: string
    cancel: string
    confirmTitle: string
    confirmDescription: string
    actionSuccess: string
  }
  feedback: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
  }
  statuses: {
    draft: string
    published: string
    archived: string
  }
  categories: {
    all: string
    it: string
    marketing: string
    sales: string
    hr: string
  }
  pagination: {
    prev: string
    next: string
    pageOf: string
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
    notificationTitle: string
    notificationEmpty: string
    notificationError: string
    notificationLoading: string
    markAllRead: string
    profileSettings: string
    profileLogout: string
    adminRole: string
    quickLinks: string
    quickDashboard: string
    quickUsers: string
    quickCompanies: string
    quickJobs: string
    quickAi: string
    quickSettings: string
  }
  stats: {
    totalLabel: string
    candidatesLabel: string
    employersLabel: string
    adminsLabel: string
    lockedLabel: string
    totalDelta: string
    candidatesDelta: string
    employersDelta: string
    lockedDelta: string
  }
  statusOverview: {
    title: string
    description: string
    totalLabel: string
    distributionLabel: string
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
    actionSuspend: string
    actionBan: string
    actionArchive: string
    actionRestore: string
  }
  pagination: {
    prev: string
    next: string
    pageOf: string
  }
  roles: {
    ADMIN: string
    RECRUITER: string
    CANDIDATE: string
    admin: string
    recruiter: string
    candidate: string
  }
  statuses: {
    ACTIVE: string
    INACTIVE: string
    SUSPENDED: string
    LOCKED: string
    BANNED: string
    ARCHIVED: string
    active: string
    inactive: string
    suspended: string
    locked: string
    banned: string
    archived: string
  }
  actions: {
    title: string
    description: string
    reasonLabel: string
    reasonPlaceholder: string
    reasonRequired: string
    suspend: string
    ban: string
    archive: string
    restore: string
    confirm: string
    cancel: string
  }
  feedback: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
    actionSuccess: string
    actionError: string
    cannotManageSelf: string
  }
  detail: {
    routeLabel: string
    back: string
    title: string
    contact: string
    lifecycle: string
    company: string
    noCompany: string
    emailVerified: string
    emailUnverified: string
    statusReason: string
    changedAt: string
    createdAt: string
    updatedAt: string
    lastLoginAt: string
    contactDescription: string
    lifecycleDescription: string
    timeline: string
    timelineDescription: string
    phoneNotProvided: string
    statusReasonNotProvided: string
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
    suspendedLabel: string
    pendingDelta: string
    approvedDelta: string
    rejectedDelta: string
  }
  filters: {
    queryLabel: string
    queryPlaceholder: string
    statusLabel: string
    statusAll: string
    trustLevelLabel: string
    trustLevelAll: string
    sortLabel: string
    sortLatest: string
    sortOldest: string
    sortRejected: string
    rejectedBefore: string
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
      trustLevel: string
      actions: string
    }
    actions: {
      viewDetail: string
      approve: string
      reject: string
      verified: string
      reviewAgain: string
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
    suspended: string
  }
  trustLevels: { low: string; medium: string; high: string }
  feedback: {
    loading: string; errorTitle: string; errorDescription: string; retry: string
    actionSuccess: string; actionError: string
  }
  actions: {
    cancel: string; confirm: string; approveTitle: string; approveDescription: string
    rejectTitle: string; rejectDescription: string; reasonTitle: string; reasonDescription: string
    reasonLabel: string; reasonPlaceholder: string; reasonRequired: string
  }
  detail: {
    pageTitle: string
    backToList: string
    viewPublicPage: string
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
    suspendedHint: string
    approve: string
    reject: string
    suspend: string
    restore: string
    completionLabel: string
    contactLabel: string
    statusReasonLabel: string
    trustLevelLabel: string
    trustChangeTitle: string
    trustHistoryTitle: string
    trustHistoryDescription: string
    trustHistoryEmpty: string
    trustHistoryError: string
    documentsLoading: string
    documentsEmpty: string
    documentsError: string
    opening: string
    quickStatsTitle: string
    jobPostsLabel: string
    applicantsLabel: string
    responseRateLabel: string
    reviewCountLabel: string
    approvedRiskLabel: string
    negativeSignalLabel: string
    canPostJobsLabel: string
    yes: string
    no: string
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
    applied: string
    appliedHint: string
    applyHint: string
    applyLoginHint: string
    applyStatusLoading: string
    candidateOnly: string
    save: string
    saved: string
    saveError: string
    jobNotPublic: string
    loginHint: string
    applyModal: {
      kicker: string
      title: string
      description: string
      close: string
      cvLabel: string
      cvHelper: string
      cvLoading: string
      profileLoadError: string
      cvFallback: string
      defaultCvBadge: string
      selectedCvBadge: string
      noCvTitle: string
      noCvDescription: string
      uploadCvAction: string
      uploadFirstTitle: string
      uploadFirstDescription: string
      uploadAlternativeTitle: string
      uploadAlternativeDescription: string
      cvUploading: string
      cvUploadSuccess: string
      cvUploadError: string
      cvInvalidType: string
      cvTooLarge: string
      coverLetterLabel: string
      coverLetterPlaceholder: string
      coverLetterHint: string
      coverLetterCounter: string
      coverLetterTooLong: string
      submit: string
      submitting: string
      submitError: string
      jobNotApplicableError: string
      cvNotFoundError: string
      submitSuccessTitle: string
      submitSuccessDescription: string
      duplicateTitle: string
      duplicateDescription: string
      viewApplications: string
      parseStatuses: {
        NOT_PARSED: string
        PARSING: string
        PARSED: string
        FAILED: string
      }
    }
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
  follow: {
    follow: string
    following: string
    loading: string
    loginRequired: string
    candidateOnly: string
    followSuccess: string
    unfollowSuccess: string
    unavailable: string
    error: string
  }
  snapshot: {
    openJobs: string
    size: string
    founded: string
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
  | 'CANCELLED'

export type ApplicationProgressDisplayStep = 'CV_SUBMITTED' | 'CV_RECEIVED' | 'CV_VIEWED' | 'RESPONDED'

export type CandidateManagedJobsTab = 'all' | 'saved' | 'applied' | 'active' | 'closed'
export type CandidateManagedJobsSort = 'newest' | 'deadline' | 'salary'
export type CandidateManagedJobsStatus =
  | 'saved'
  | 'SUBMITTED'
  | 'OFFERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'CLOSED'
  | 'EXPIRED'
  | 'needsAttention'

export type CandidateCvsTab = 'editing' | 'submitted' | 'profile'
export type CandidateCvsParseStatus = 'NOT_PARSED' | 'PARSING' | 'PARSED' | 'FAILED'

export type CandidateCvsTranslations = {
  routeLabel: string
  pageTitle: string
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryAction: string
    secondaryAction: string
  }
  stats: {
    drafts: string
    submitted: string
    profileCvs: string
    defaultCv: string
  }
  tabs: Record<CandidateCvsTab, string>
  sections: {
    editingTitle: string
    editingDescription: string
    submittedTitle: string
    submittedDescription: string
    profileTitle: string
    profileDescription: string
  }
  actions: {
    newCv: string
    continueEditing: string
    rename: string
    saveName: string
    cancel: string
    delete: string
    confirmDelete: string
    keepCv: string
    upload: string
    uploading: string
    parse: string
    parsing: string
    openSubmitted: string
    opening: string
    viewJob: string
    retry: string
  }
  meta: {
    updatedAt: string
    createdAt: string
    submittedAt: string
    job: string
    company: string
    status: string
    pages: string
    defaultBadge: string
    localDraft: string
    notAvailable: string
    fileSize: string
  }
  parseStatus: Record<CandidateCvsParseStatus, string>
  applicationStatus: Record<ProfileApplicationStatus, string>
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    emptyDraftsTitle: string
    emptyDraftsDescription: string
    emptySubmittedTitle: string
    emptySubmittedDescription: string
    emptyProfileTitle: string
    emptyProfileDescription: string
    renameSuccess: string
    renameError: string
    deleteSuccess: string
    deleteError: string
    profileDeleteSuccess: string
    profileDeleteError: string
    uploadSuccess: string
    uploadError: string
    parseStarted: string
    parseError: string
    openSubmittedError: string
  }
  validation: {
    nameRequired: string
    invalidType: string
    tooLarge: string
  }
}

export type UserNotificationTranslations = {
  label: string
  title: string
  empty: string
  error: string
  loading: string
  markAllRead: string
}

export type ProfileTranslations = {
  routeLabel: string
  pageTitle: string
  sidebar: {
    searchJobs: string
    managedJobs: string
    applications: string
    navigationMenu: string
    profile: string
    messages: string
    currentRole: string
  }
  topbar: {
    logout: string
    notifications: UserNotificationTranslations
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
    saveSuccess: string
    saveError: string
    avatarUploadSuccess: string
    avatarUploadError: string
    avatarInvalidFileType: string
    avatarFileTooLarge: string
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
  cvAssist: {
    eyebrow: string
    title: string
    description: string
    descriptionSparse: string
    readyTitle: string
    parsedTitle: string
    parsedDescription: string
    hint: string
    uploadAction: string
    uploadingAction: string
    parseAction: string
    parsingAction: string
    replaceAction: string
    manualAction: string
  }
  cvParseReview: {
    eyebrow: string
    title: string
    description: string
    currentLabel: string
    parsedLabel: string
    emptyValue: string
    moreItems: string
    recommendedBadge: string
    closeLabel: string
    keepCurrent: string
    applySelected: string
    applying: string
    applySuccess: string
    keepSuccess: string
    groupLabels: {
      basic: string
      contact: string
      skills: string
      experiences: string
      education: string
      links: string
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
    progress: {
      label: string
      steps: Record<ApplicationProgressDisplayStep, string>
      descriptions: Record<ApplicationProgressDisplayStep, string>
      cancelledTitle: string
      cancelledDescription: string
    }
    states: {
      loading: string
      errorTitle: string
      errorDescription: string
      retry: string
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
  managedJobs: {
    routeLabel: string
    pageTitle: string
    title: string
    description: string
    listLabel: string
    stats: {
      label: string
      saved: string
      applied: string
      active: string
      needsAttention: string
    }
    filters: {
      label: string
      searchLabel: string
      searchPlaceholder: string
      tabLabel: string
      tabs: Record<CandidateManagedJobsTab, string>
      sortLabel: string
      sortOptions: Record<CandidateManagedJobsSort, string>
    }
    statusLabels: Record<CandidateManagedJobsStatus, string>
    meta: {
      location: string
      salary: string
      deadline: string
      savedAt: string
      appliedAt: string
      notAvailable: string
      noDeadline: string
    }
    actions: {
      viewJob: string
      apply: string
      viewApplication: string
      removeSaved: string
      removingSaved: string
    }
    states: {
      loading: string
      errorTitle: string
      errorDescription: string
      retry: string
      removeSavedError: string
    }
    empty: {
      allTitle: string
      allDescription: string
      allAction: string
      savedTitle: string
      savedDescription: string
      savedAction: string
      appliedTitle: string
      appliedDescription: string
      appliedAction: string
      filterTitle: string
      filterDescription: string
      filterAction: string
    }
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
      replaceFileLabel: string
      uploadingFileLabel: string
      dropTitle: string
      dropHint: string
      parseAction: string
      retryParseAction: string
      parsingLabel: string
      parseHint: string
      pdfRecommended: string
      statusLabel: string
      status: Record<'NOT_PARSED' | 'PARSING' | 'PARSED' | 'FAILED', string>
      uploadSuccess: string
      parseStarted: string
      parseSuccess: string
      parseSuccessWithLocalChanges: string
      parseReviewReady: string
      parseNoChanges: string
      parseReviewApplied: string
      parseReviewKept: string
      parseFailed: string
      parseTimeout: string
      invalidFileType: string
      fileTooLarge: string
      saveBeforeParseError: string
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
    notifications: UserNotificationTranslations
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
      candidateProfiles: {
        label: string
        delta: string
      }
      totalApplications: {
        label: string
        delta: string
      }
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
    items: ReadonlyArray<{
      id: string
      description: string
      disabledWhenUnverified?: boolean
      href: string
      label: string
    }>
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
    statusLabels: Record<'SUBMITTED' | 'OFFERED' | 'REJECTED' | 'CANCELLED', string>
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
      saveChanges: string
      savingChanges: string
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
    viewApplications: string
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
    ruleLabels: Record<string, string>
    noModeration: string
    publicLinkUnavailable: string
    applicationsDescription: string
    noApplications: string
    reviewMessage: string
    reviewStatus: string
    reviewedAt: string
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
    selectedJobFallback: string
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
  meta: {
    cvFile: string
    noCoverLetter: string
    notAvailable: string
  }
  states: {
    cvError: string
    detailError: string
    errorDescription: string
    errorTitle: string
    loading: string
    retry: string
    statusError: string
    statusSuccess: string
  }
  match: {
    title: string
    description: string
    processing: string
    cvFailed: string
    notScored: string
    scored: string
    emptySummary: string
    runAction: string
    refreshAction: string
    retryAction: string
    processingAction: string
    started: string
    error: string
    timeout: string
    cvParseStatusLabel: string
    levels: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT', string>
    cvParseStatus: Record<'NOT_PARSED' | 'PARSING' | 'PARSED' | 'FAILED', string>
    recommendationLabel: string
    decisionLabel: string
    priorityLabel: string
    recommendations: Record<'GOOD_FIT' | 'PARTIAL_FIT' | 'LOW_FIT' | 'INSUFFICIENT_DATA', string>
    decisions: Record<'SHORTLIST' | 'REVIEW_MANUALLY' | 'REJECT' | 'INSUFFICIENT_DATA', string>
    priorities: Record<'LOW' | 'MEDIUM' | 'HIGH', string>
    matchedSkills: string
    missingSkills: string
    nextActions: string
    riskFlags: string
    emptyList: string
  }
  statusLabels: {
    SUBMITTED: string
    OFFERED: string
    REJECTED: string
    CANCELLED: string
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
    offerAction: string
    rejectAction: string
    appliedJobLabel: string
    submittedLabel: string
    updatedLabel: string
    scoreLabel: string
    decision: {
      title: string
      description: string
      readOnlyDescription: string
      offeredResultTitle: string
      offeredResultDescription: string
      rejectedResultTitle: string
      rejectedResultDescription: string
      noFeedback: string
      feedbackLabel: string
      feedbackPlaceholder: string
      feedbackHint: string
      characterCount: string
      offerAction: string
      rejectAction: string
      submitting: string
      confirmModal: {
        closeLabel: string
        offerEyebrow: string
        rejectEyebrow: string
        offerTitle: string
        rejectTitle: string
        offerToRejectTitle: string
        offerDescription: string
        rejectDescription: string
        offerToRejectDescription: string
        feedbackLabel: string
        noFeedback: string
        cancelAction: string
        offerAction: string
        rejectAction: string
        submitting: string
      }
      rejectionRequiredError: string
      maxLengthError: string
      decidedAtLabel: string
    }
  }
  pagination: {
    prev: string
    next: string
    pageOf: string
  }
}

export type RecruiterCandidatesTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  stats: {
    candidates: string
    applications: string
    strongMatches: string
  }
  matchLevels: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT', string>
  filters: {
    searchLabel: string
    searchPlaceholder: string
    statusLabel: string
    allStatuses: string
    sortLabel: string
    sortOptions: {
      lastAppliedAt: string
      bestMatchScore: string
      applicationCount: string
      candidateName: string
    }
    clear: string
  }
  results: {
    countLabel: string
    emptyTitle: string
    emptyDescription: string
    applicationCount: string
    latestJob: string
    bestMatch: string
    lastApplied: string
    viewProfile: string
    openApplication: string
  }
  detail: {
    title: string
    close: string
    contact: string
    skills: string
    applications: string
    latestApplication: string
    bestMatchedApplication: string
    noSkills: string
    noData: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    detailError: string
    retry: string
  }
}

export type RecruiterSettingsTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  navigation: {
    label: string
    account: string
    language: string
    security: string
  }
  account: {
    title: string
    description: string
    fullNameLabel: string
    fullNamePlaceholder: string
    emailLabel: string
    emailHint: string
    contactEmailLabel: string
    contactEmailPlaceholder: string
    contactEmailHint: string
    contactEmailUnavailableHint: string
    phoneLabel: string
    phonePlaceholder: string
    phoneHint: string
    roleLabel: string
    companyLabel: string
    recruiterRole: string
    noCompany: string
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
    save: string
    saveLoading: string
    reset: string
    saveSuccess: string
    saveError: string
    validation: {
      fullNameRequired: string
      fullNameMinLength: string
      fullNameMaxLength: string
      phoneMaxLength: string
      contactEmailInvalid: string
      contactEmailMaxLength: string
    }
  }
  language: {
    title: string
    description: string
    controlLabel: string
    helper: string
    reset: string
    save: string
    saveError: string
    saveLoading: string
    saveSuccess: string
  }
  security: {
    title: string
    description: string
    currentPasswordLabel: string
    newPasswordLabel: string
    confirmPasswordLabel: string
    showPassword: string
    hidePassword: string
    submit: string
    submitLoading: string
    submitSuccess: string
    submitError: string
    validation: {
      currentRequired: string
      newRequired: string
      confirmRequired: string
      passwordMinLength: string
      passwordMaxLength: string
      passwordMismatch: string
      passwordReuse: string
    }
    apiErrors: {
      invalidCredentials: string
      passwordReuse: string
      credentialMissing: string
    }
  }
}

export type RecruiterVerificationTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  navigation: {
    label: string
    status: string
    legal: string
    documents: string
  }
  status: {
    labels: Record<'NO_COMPANY' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', string>
    titles: Record<'NO_COMPANY' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', string>
    descriptions: Record<'NO_COMPANY' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED', string>
    completion: string
    submittedAt: string
    notSubmitted: string
    postingAccess: string
    postingUnlocked: string
    postingLocked: string
    rejectionReason: string
    missingTitle: string
    missingFieldLabels: Record<'name' | 'taxCode' | 'website' | 'address' | 'description', string>
  }
  legal: {
    title: string
    description: string
    approvedWarning: string
    suspendedHint: string
    nameLabel: string
    namePlaceholder: string
    taxCodeLabel: string
    taxCodePlaceholder: string
    websiteLabel: string
    websitePlaceholder: string
    addressLabel: string
    addressPlaceholder: string
    descriptionLabel: string
    descriptionPlaceholder: string
    logoTitle: string
    logoDescription: string
    logoAction: string
    logoReplace: string
    logoSelected: string
    logoHint: string
    logoInvalidType: string
    logoTooLarge: string
    validation: {
      nameRequired: string
      taxCodeRequired: string
      taxCodeMinLength: string
      websiteRequired: string
      websiteInvalid: string
      addressRequired: string
      descriptionRequired: string
    }
  }
  documents: {
    title: string
    description: string
    typeLabel: string
    types: Record<'BUSINESS_LICENSE' | 'TAX_CERTIFICATE' | 'DOMAIN_PROOF' | 'OTHER', string>
    uploadAction: string
    dropTitle: string
    dropHint: string
    queuedTitle: string
    attachedTitle: string
    emptyTitle: string
    emptyDescription: string
    removeQueued: string
    deleteAttached: string
    deleting: string
    invalidType: string
    tooLarge: string
    required: string
    fileSize: string
  }
  actions: {
    create: string
    save: string
    resubmit: string
    saving: string
    retry: string
    backToDashboard: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
  }
  feedback: {
    saveSuccess: string
    resubmitSuccess: string
    submitError: string
    deleteError: string
  }
  nextBanner: {
    title: string
    description: string
    action: string
  }
}

export type CandidateSettingsTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  language: {
    title: string
    description: string
    controlLabel: string
    helper: string
    reset: string
    save: string
    saveError: string
    saveLoading: string
    saveSuccess: string
  }
  security: {
    title: string
    description: string
    currentPasswordLabel: string
    newPasswordLabel: string
    confirmPasswordLabel: string
    showPassword: string
    hidePassword: string
    submit: string
    submitLoading: string
    submitSuccess: string
    submitError: string
    validation: {
      currentRequired: string
      newRequired: string
      confirmRequired: string
      passwordMinLength: string
      passwordMaxLength: string
      passwordMismatch: string
      passwordReuse: string
    }
    apiErrors: {
      invalidCredentials: string
      passwordReuse: string
      credentialMissing: string
    }
  }
}

export type RecruiterCompanyTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  hero: {
    kicker: string
    companyLabel: string
  }
  form: {
    storyTitle: string
    storyDescription: string
    descriptionLabel: string
    descriptionPlaceholder: string
    descriptionHint: string
    missionLabel: string
    missionPlaceholder: string
    missionHint: string
    cultureLabel: string
    culturePlaceholder: string
    cultureHint: string
    highlightsTitle: string
    highlightsDescription: string
    valuesLabel: string
    valuesPlaceholder: string
    valuesHint: string
    perksLabel: string
    perksPlaceholder: string
    perksHint: string
    factsTitle: string
    factsDescription: string
    industryLabel: string
    industryPlaceholder: string
    industryHint: string
    sizeLabel: string
    sizePlaceholder: string
    sizeHint: string
    foundedYearLabel: string
    foundedYearPlaceholder: string
    foundedYearHint: string
    contactTitle: string
    contactDescription: string
    logoTitle: string
    logoDescription: string
    logoAction: string
    logoReplace: string
    logoSelected: string
    logoHint: string
    logoInvalidType: string
    logoTooLarge: string
    heroImageUrlLabel: string
    heroImageUrlPlaceholder: string
    heroImageUrlHint: string
    heroImageTitle: string
    heroImageDescription: string
    heroImageUpload: string
    heroImageReplace: string
    heroImageSelected: string
    heroImageHint: string
    heroImageInvalidType: string
    heroImageTooLarge: string
    websiteLabel: string
    websitePlaceholder: string
    websiteHint: string
    contactEmailLabel: string
    contactEmailPlaceholder: string
    contactEmailHint: string
    addressLabel: string
    addressPlaceholder: string
    addressHint: string
    save: string
    saving: string
    reset: string
    noChanges: string
    saveSuccess: string
    saveError: string
    readOnlyHint: string
    validation: {
      addressMaxLength: string
      contactEmailInvalid: string
      contactEmailMaxLength: string
      cultureMaxLength: string
      descriptionMaxLength: string
      foundedYearInvalid: string
      heroImageUrlInvalid: string
      heroImageUrlMaxLength: string
      industryMaxLength: string
      missionMaxLength: string
      perksItemMaxLength: string
      perksMaxItems: string
      sizeMaxLength: string
      valuesItemMaxLength: string
      valuesMaxItems: string
      websiteInvalid: string
      websiteMaxLength: string
    }
  }
  preview: {
    title: string
    description: string
    factsLabel: string
    industryLabel: string
    heroImageFallback: string
    industryFallback: string
    sizeLabel: string
    sizeFallback: string
    foundedYearLabel: string
    foundedYearFallback: string
    aboutLabel: string
    missionLabel: string
    cultureLabel: string
    contactLabel: string
    valuesLabel: string
    perksLabel: string
    emptyDescription: string
    emptyMission: string
    emptyCulture: string
    emptyContact: string
    emptyValues: string
    emptyPerks: string
    openReview: string
    reviewHint: string
    heroImageChangeLabel: string
    logoChangeLabel: string
  }
  review: {
    kicker: string
    title: string
    description: string
    closeLabel: string
    factsLabel: string
    heroImageFallback: string
    websiteLabel: string
    contactEmailLabel: string
    addressLabel: string
    websiteFallback: string
    contactEmailFallback: string
    addressFallback: string
    missionLabel: string
    cultureLabel: string
    valuesLabel: string
    perksLabel: string
    contactLabel: string
    emptyDescription: string
    emptyMission: string
    emptyCulture: string
    emptyValues: string
    emptyPerks: string
  }
  statuses: {
    NO_COMPANY: string
    PENDING: string
    APPROVED: string
    REJECTED: string
    SUSPENDED: string
  }
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
    noCompanyKicker: string
    noCompanyTitle: string
    noCompanyDescription: string
    noCompanyAction: string
  }
  nextBanner: {
    title: string
    description: string
    action: string
  }
}

export type AdminDashboardTranslations = {
  routeLabel: string
  pageTitle: string
  subtitle: string
  loadingLabel: string
  header: {
    lastUpdated: string
    refresh: string
    refreshing: string
  }
  growth: {
    title: string
    description: string
    demoBadge: string
    comparisonLabel: string
    unavailableLabel: string
    totalUsers: string
    newUsers: string
    periods: {
      '7d': string
      '30d': string
      '90d': string
    }
  }
  error: {
    title: string
    description: string
    retry: string
  }
  empty: {
    title: string
    description: string
  }
  stats: {
    users: string
    pendingCompanies: string
    pendingJobs: string
    pendingRevisions: string
  }
  charts: {
    usersByRole: string
    companiesByStatus: string
    jobsByStatus: string
    noData: string
  }
  roles: {
    CANDIDATE: string
    RECRUITER: string
    ADMIN: string
  }
  companyStatuses: {
    PENDING: string
    APPROVED: string
    REJECTED: string
    SUSPENDED: string
  }
  jobStatuses: Record<string, string>
  queues: {
    title: string
    description: string
    companies: string
    jobs: string
    revisions: string
    action: string
  }
}

export type AdminJobsTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  tabs: { all: string; review: string; revisions: string }
  stats: { total: string; review: string; published: string; revisions: string }
  filters: {
    searchLabel: string; searchPlaceholder: string; statusLabel: string; statusAll: string
    riskLabel: string; riskAll: string; companyLabel: string; companyAll: string
    sortLabel: string; clear: string
  }
  columns: { job: string; company: string; status: string; risk: string; applications: string; updated: string; actions: string }
  statuses: Record<string, string>
  risks: Record<string, string>
  sorts: { latest: string; oldest: string; risk: string; applications: string }
  detail: {
    title: string
    jobContent: string
    description: string
    requirements: string
    benefits: string
    skills: string
    overview: string
    employmentType: string
    workingType: string
    experienceLevel: string
    location: string
    salary: string
    openings: string
    applications: string
    deadline: string
    version: string
    systemInfo: string
    jobId: string
    companyId: string
    categoryId: string
    lifecycle: string
    createdAt: string
    updatedAt: string
    reviewedAt: string
    publishedAt: string
    unpublishedAt: string
    closedAt: string
    reviewReason: string
    unpublishReason: string
    moderation: string
    moderationDecision: string
    reasons: string
    rules: string
    reasonLabels: Record<string, string>
    ruleLabels: Record<string, string>
    employmentTypes: Record<string, string>
    workingTypes: Record<string, string>
    experienceLevels: Record<string, string>
    decisions: Record<string, string>
    changeSummary: string
    revisionInfo: string
    revisionId: string
    originalJobId: string
    salaryHidden: string
    salaryNegotiable: string
    notSet: string
    notAssessed: string
    noData: string
    close: string
  }
  actions: {
    view: string; approve: string; reject: string; unpublish: string; republish: string; close: string
    cancel: string; confirmTitle: string; confirmDescription: string; reasonTitle: string
    reasonDescription: string; reasonLabel: string; reasonPlaceholder: string; reasonRequired: string
  }
  feedback: {
    loading: string; errorTitle: string; errorDescription: string; retry: string
    emptyTitle: string; emptyDescription: string; countLabel: string
    actionSuccess: string; actionError: string
  }
  pagination: { prev: string; next: string; pageOf: string }
}

export type AdminSettingsTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  summary: { accountId: string; email: string; role: string; adminRole: string; fallbackName: string; changeAvatar: string; saveAvatar: string; cancelAvatar: string; removeAvatar: string; avatarHint: string; invalidAvatar: string; avatarError: string }
  profile: {
    title: string; description: string; fullName: string; fullNamePlaceholder: string
    phone: string; phonePlaceholder: string; email: string; emailHint: string; role: string
    save: string; saving: string; reset: string; saveSuccess: string; saveError: string
    validation: { fullNameRequired: string; fullNameMin: string; fullNameMax: string; phoneInvalid: string; phoneMax: string }
  }
  password: {
    title: string; description: string; current: string; next: string; confirm: string
    show: string; hide: string; submit: string; submitting: string; success: string; error: string
    rulesTitle: string; lengthRule: string; caseRule: string; numberRule: string; symbolRule: string
    validation: { currentRequired: string; nextRequired: string; confirmRequired: string; length: string; mismatch: string; reuse: string }
    apiErrors: { invalidCredentials: string; passwordReuse: string; credentialMissing: string }
  }
  preferences: {
    title: string; description: string; language: string; languageHint: string
    languageReset: string; languageSave: string; languageSaveError: string
    languageSaveSuccess: string; languageSaving: string
    sessionTitle: string; sessionDescription: string; logout: string
  }
  logout: { title: string; description: string; confirm: string; cancel: string }
  feedback: { loading: string; errorTitle: string; errorDescription: string; retry: string }
}

export type AdminAiManagementTranslations = {
  routeLabel: string
  pageTitle: string
  sidebarLabel: string
  pageSubtitle: string
  header: { title: string; refresh: string; refreshing: string; healthy: string; degraded: string; unknown: string }
  tabs: { overview: string; config: string; logs: string }
  notes: { newRequests: string; apiKeys: string; estimatedCost: string }
  config: {
    title: string; description: string; provider: string; gemini: string; openAi: string
    geminiModel: string; openAiModel: string; save: string; saving: string
    updatedAt: string; updatedBy: string; neverUpdated: string; loadErrorTitle: string
    loadErrorDescription: string; retry: string; success: string; error: string; undo: string
    activeProvider: string; selectedModel: string
  }
  summary: {
    title: string; description: string; totalRequests: string; succeededRequests: string; failedRequests: string
    totalTokens: string; estimatedCost: string; noPricing: string; empty: string
    errorTitle: string; errorDescription: string; retry: string; successRate: string; providerBreakdown: string
    columns: { provider: string; model: string; requests: string; success: string; failed: string; failureRate: string; inputTokens: string; outputTokens: string; totalTokens: string; cost: string }
  }
  logs: {
    title: string; description: string; count: string; provider: string; model: string
    status: string; dateFrom: string; dateTo: string; candidateCvId: string
    allProviders: string; allModels: string; allStatuses: string; apply: string; clear: string
    loading: string; errorTitle: string; errorDescription: string; retry: string
    emptyTitle: string; emptyDescription: string; copied: string; copy: string
    noValue: string; succeeded: string; failed: string; noPricing: string
    columns: { request: string; providerModel: string; status: string; tokens: string; latency: string; cost: string; createdAt: string; error: string }
  }
  pagination: { prev: string; next: string; pageOf: string }
}

export type AdminJobModerationPoliciesTranslations = {
  routeLabel: string
  pageTitle: string
  sidebarLabel: string
  pageSubtitle: string
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  actions: {
    addAlias: string
    addKeyword: string
    archive: string
    archiving: string
    cancel: string
    close: string
    createDraft: string
    deleteSelected: string
    loadDefault: string
    loadingDefault: string
    publish: string
    publishing: string
    refresh: string
    retry: string
    restoreAsActive: string
    restoring: string
    saveChanges: string
    saveDraft: string
    saving: string
    testRules: string
    testing: string
    viewDetail: string
  }
  statuses: {
    ACTIVE: string
    ARCHIVED: string
    DRAFT: string
    UNPUBLISHED: string
  }
  misc: {
    never: string
    newDraftStatus: string
    notCreated: string
    none: string
  }
  ruleFields: {
    allCapsTitleScore: string
    criticalThreshold: string
    descriptionScore: string
    excessiveSymbolsScore: string
    experience: string
    externalFormDomains: string
    externalFormScore: string
    internshipSalaryMax: string
    internshipSalaryScore: string
    lowTrustScore: string
    maxExternalLinks: string
    maxTitleSymbols: string
    maximumSalary: string
    mediumThreshold: string
    missingLocationScore: string
    highThreshold: string
    minDescriptionLength: string
    minRequirementsLength: string
    paymentSignals: string
    remoteUpfrontPaymentScore: string
    repeatedWordScore: string
    repeatedWordThreshold: string
    requirementsScore: string
    score: string
    shortenedDomains: string
    shortenedUrlScore: string
    tooManyLinksScore: string
  }
  testResult: {
    matched: string
    reasons: string
  }
  confirmations: {
    archiveDescription: string
    archiveTitle: string
    deleteKeywordDescription: string
    deleteKeywordTitle: string
    loadDefaultDescription: string
    loadDefaultTitle: string
    publishDescription: string
    publishTitle: string
    restoreDescription: string
    restoreTitle: string
  }
  summary: {
    activePolicy: string
    chooseRow: string
    currentFilter: string
    loading: string
    newDraft: string
    noActive: string
    none: string
    notLoaded: string
    selected: string
    searching: string
    unsavedPolicy: string
    version: string
    visiblePolicies: string
  }
  table: {
    action: string
    empty: string
    keywords: string
    name: string
    rules: string
    status: string
    updated: string
    version: string
  }
  drawer: {
    activeRulesLocked: string
    createDescription: string
    createTitle: string
    detailDescription: string
    detailFallbackTitle: string
    loading: string
    readOnly: string
  }
  sections: {
    contentRules: string
    keywordDescription: string
    keywordRules: string
    linkSpamTrust: string
    salaryRules: string
    summaryCreateDescription: string
    summaryCreateTitle: string
    summaryDetailDescription: string
    summaryDetailTitle: string
    testActiveDescription: string
    testDraftDescription: string
    testPanel: string
    thresholds: string
    thresholdsDescription: string
  }
  fields: {
    allStatuses: string
    companyTrust: string
    created: string
    createdBy: string
    description: string
    employmentType: string
    experience: string
    keywordAlias: string
    location: string
    policyName: string
    reason: string
    requirements: string
    ruleGroup: string
    searchPolicy: string
    searchPolicyPlaceholder: string
    salaryMax: string
    salaryMin: string
    score: string
    skills: string
    status: string
    title: string
    updated: string
    updatedBy: string
    version: string
    workingType: string
  }
  feedback: {
    archiveError: string
    archived: string
    createError: string
    created: string
    defaultLoaded: string
    loadError: string
    nameRequired: string
    publishError: string
    published: string
    saveError: string
    saved: string
    selectKeyword: string
    testError: string
  }
}

export type Translations = {
  common: CommonTranslations
  pages: {
    adminAiManagement: AdminAiManagementTranslations
    adminDashboard: AdminDashboardTranslations
    adminCvTemplates: AdminCvTemplatesTranslations
    adminCompanies: AdminCompaniesTranslations
    adminJobModerationPolicies: AdminJobModerationPoliciesTranslations
    adminJobs: AdminJobsTranslations
    adminSettings: AdminSettingsTranslations
    adminUsers: AdminUsersTranslations
    candidateCvs: CandidateCvsTranslations
    companies: CompaniesTranslations
    comingSoon: ComingSoonTranslations
    candidateSettings: CandidateSettingsTranslations
    companyDetail: CompanyDetailTranslations
    cvTemplates: CvTemplatesTranslations
    forgotPassword: ForgotPasswordTranslations
    home: HomeTranslations
    infoPages: InfoPagesTranslations
    jobDetail: JobDetailTranslations
    login: LoginTranslations
    profile: ProfileTranslations
    recruiterApplications: RecruiterApplicationsTranslations
    recruiterCandidates: RecruiterCandidatesTranslations
    recruiterJobCreate: RecruiterJobCreateTranslations
    recruiterJobs: RecruiterJobsTranslations
    recruiterHome: RecruiterHomeTranslations
    recruiterCompany: RecruiterCompanyTranslations
    recruiterSettings: RecruiterSettingsTranslations
    recruiterVerification: RecruiterVerificationTranslations
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

export type InfoPageKey =
  | 'latestJobs'
  | 'itJobs'
  | 'marketingJobs'
  | 'postJob'
  | 'businessHiring'
  | 'helpCenter'
  | 'contact'
  | 'privacyPolicy'
  | 'terms'

export type InfoPageSection = {
  title: string
  description: string
  bullets?: ReadonlyArray<string>
}

export type InfoPageContent = {
  badge: string
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  intro: string
  sections: ReadonlyArray<InfoPageSection>
  cta: {
    title: string
    description: string
    primaryLabel: string
    primaryHref: string
    secondaryLabel?: string
    secondaryHref?: string
  }
}

export type InfoPagesTranslations = {
  pages: Record<InfoPageKey, InfoPageContent>
}
