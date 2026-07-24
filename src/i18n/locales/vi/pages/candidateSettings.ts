import type { CandidateSettingsTranslations } from '../../../types'

export const candidateSettings: CandidateSettingsTranslations = {
  routeLabel: 'Cài đặt',
  pageTitle: 'Cài đặt tài khoản',
  pageSubtitle: 'Cập nhật mật khẩu dùng để đăng nhập vào tài khoản ứng viên.',
  security: {
    title: 'Đổi mật khẩu',
    description: 'Dùng mật khẩu riêng cho NexHire và không sử dụng lại mật khẩu cũ.',
    currentPasswordLabel: 'Mật khẩu hiện tại',
    newPasswordLabel: 'Mật khẩu mới',
    confirmPasswordLabel: 'Xác nhận mật khẩu mới',
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    submit: 'Đổi mật khẩu',
    submitLoading: 'Đang cập nhật…',
    submitSuccess: 'Mật khẩu của bạn đã được cập nhật.',
    submitError: 'Không thể đổi mật khẩu. Hãy kiểm tra kết nối và thử lại.',
    validation: {
      currentRequired: 'Nhập mật khẩu hiện tại.',
      newRequired: 'Nhập mật khẩu mới.',
      confirmRequired: 'Xác nhận mật khẩu mới.',
      passwordMinLength: 'Mật khẩu phải có ít nhất 8 ký tự.',
      passwordMaxLength: 'Mật khẩu không được vượt quá 128 ký tự.',
      passwordMismatch: 'Mật khẩu xác nhận chưa khớp. Hãy nhập lại mật khẩu mới.',
      passwordReuse: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
    },
    apiErrors: {
      invalidCredentials: 'Mật khẩu hiện tại chưa đúng. Hãy kiểm tra và thử lại.',
      passwordReuse: 'Mật khẩu này đã được sử dụng trước đây. Hãy chọn mật khẩu khác.',
      credentialMissing: 'Tài khoản này không có mật khẩu để thay đổi. Hãy dùng phương thức đăng nhập ban đầu.',
    },
  },
}
