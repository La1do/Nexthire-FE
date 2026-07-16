export const login = {
  title: 'おかえりなさい',
  subtitle: 'NexHire を続けるにはログインしてください',
  form: {
    roleLabel: 'ログインする役割',
    roleOptions: [
      { value: 'candidate', label: '候補者' },
      { value: 'employer', label: '採用担当者' },
    ],
    emailLabel: 'メール',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'パスワード',
    passwordPlaceholder: 'パスワードを入力',
    rememberMe: 'ログイン状態を保持',
    forgotPassword: 'パスワードをお忘れですか？',
    showPassword: 'パスワードを表示',
    hidePassword: 'パスワードを隠す',
    submit: 'ログイン',
    submitLoading: 'ログイン中...',
  },
  footer: {
    prompt: 'アカウントをお持ちでないですか？',
    action: '今すぐ登録',
  },
  validation: {
    emailRequired: 'メールを入力してください。',
    emailInvalid: '有効なメールを入力してください。',
    passwordRequired: 'パスワードを入力してください。',
  },
}
