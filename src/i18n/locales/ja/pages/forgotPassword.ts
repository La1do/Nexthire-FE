export const forgotPassword = {
  routeLabel: 'パスワード再設定',
  backToLogin: 'ログインに戻る',
  steps: {
    request: {
      title: 'パスワードをお忘れですか？',
      subtitle: 'パスワード再設定コードを受け取るメールを入力してください',
    },
    sent: {
      title: 'メールを送信しました',
      subtitle: '{{email}} の受信箱を確認し、6桁のコードでパスワードを再設定してください。',
    },
    verify: {
      title: '認証コードを入力',
      subtitle: 'メールに送信された6桁のコードを入力してください',
    },
    reset: {
      title: '新しいパスワードを設定',
      subtitle: '新しいパスワードは以前のものと異なる必要があります',
    },
    success: {
      title: '認証が完了しました！',
      subtitle: 'リダイレクトしています...',
    },
  },
  form: {
    codeDigitLabel: '認証コードの数字',
    confirmPasswordLabel: '新しいパスワード確認',
    confirmPasswordPlaceholder: 'パスワードを再入力',
    emailLabel: 'メール',
    emailPlaceholder: 'name@company.com',
    hidePassword: 'パスワードを隠す',
    passwordLabel: '新しいパスワード',
    passwordPlaceholder: '8文字以上',
    requestSubmit: '再設定コードを送信',
    codeContinueSubmit: '続ける',
    resendPrefix: '再送信まで',
    resendAction: 'コードを再送信',
    resendingAction: '再送信中...',
    resetSubmit: '新しいパスワードを保存',
    sentSubmit: '認証コードを入力',
    showPassword: 'パスワードを表示',
    verifySubmit: '認証',
  },
  validation: {
    codeRequired: '6桁のコードをすべて入力してください。',
    confirmPasswordRequired: '新しいパスワード確認を入力してください。',
    emailRequired: 'メールを入力してください。',
    emailInvalid: '有効なメールを入力してください。',
    passwordRequired: '新しいパスワードを入力してください。',
    passwordMinLength: 'パスワードは8文字以上で入力してください。',
    passwordMismatch: 'パスワードが一致しません。',
  },
}
