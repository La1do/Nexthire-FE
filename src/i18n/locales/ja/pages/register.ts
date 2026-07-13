export const register = {
  title: '新しいアカウントを作成',
  subtitle: 'NexHire で採用の旅を始めましょう',
  form: {
    roleLabel: '私は',
    roleOptions: [
      { value: 'candidate', label: '候補者' },
      { value: 'employer', label: '採用担当者' },
    ],
    emailLabel: 'メール',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'パスワード',
    passwordPlaceholder: '8文字以上',
    confirmPasswordLabel: 'パスワード確認',
    confirmPasswordPlaceholder: 'パスワードを再入力',
    showPassword: 'パスワードを表示',
    hidePassword: 'パスワードを隠す',
    submit: '登録',
  },
  footer: {
    prompt: 'すでにアカウントをお持ちですか？',
    action: 'ログイン',
  },
  validation: {
    emailRequired: 'メールを入力してください。',
    emailInvalid: '有効なメールを入力してください。',
    passwordRequired: 'パスワードを入力してください。',
    passwordMinLength: 'パスワードは8文字以上で入力してください。',
    confirmPasswordRequired: 'パスワード確認を入力してください。',
    passwordMismatch: 'パスワードが一致しません。',
  },
}
