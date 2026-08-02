import type { CandidateSettingsTranslations } from '../../../types'

export const candidateSettings: CandidateSettingsTranslations = {
  routeLabel: '設定',
  pageTitle: 'アカウント設定',
  pageSubtitle: '候補者アカウントへのログインに使用するパスワードを更新します。',
  security: {
    title: 'パスワードを変更',
    description: 'NexHire専用のパスワードを設定し、以前のパスワードは再利用しないでください。',
    currentPasswordLabel: '現在のパスワード',
    newPasswordLabel: '新しいパスワード',
    confirmPasswordLabel: '新しいパスワード（確認）',
    showPassword: 'パスワードを表示',
    hidePassword: 'パスワードを非表示',
    submit: 'パスワードを変更',
    submitLoading: '更新中…',
    submitSuccess: 'パスワードを更新しました。',
    submitError: 'パスワードを変更できませんでした。接続を確認して、もう一度お試しください。',
    validation: {
      currentRequired: '現在のパスワードを入力してください。',
      newRequired: '新しいパスワードを入力してください。',
      confirmRequired: '確認用のパスワードを入力してください。',
      passwordMinLength: 'パスワードは8文字以上で入力してください。',
      passwordMaxLength: 'パスワードは128文字以内で入力してください。',
      passwordMismatch: '確認用のパスワードが一致しません。新しいパスワードをもう一度入力してください。',
      passwordReuse: '新しいパスワードは現在のパスワードと異なるものを設定してください。',
    },
    apiErrors: {
      invalidCredentials: '現在のパスワードが正しくありません。確認して、もう一度お試しください。',
      passwordReuse: 'このパスワードは以前使用されています。別のパスワードを設定してください。',
      credentialMissing: 'このアカウントには変更できるパスワードがありません。登録時のログイン方法を使用してください。',
    },
  },
}
