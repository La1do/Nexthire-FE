export const forgotPassword = {
  routeLabel: 'Quên mật khẩu',
  backToLogin: 'Quay lại đăng nhập',
  steps: {
    request: {
      title: 'Quên mật khẩu?',
      subtitle: 'Nhập email để nhận mã đặt lại mật khẩu',
    },
    sent: {
      title: 'Email đã được gửi',
      subtitle: 'Kiểm tra hộp thư của {{email}} và nhập mã 6 chữ số để đặt lại mật khẩu.',
    },
    verify: {
      title: 'Nhập mã xác thực',
      subtitle: 'Nhập mã 6 chữ số được gửi đến email của bạn',
    },
    reset: {
      title: 'Đặt mật khẩu mới',
      subtitle: 'Mật khẩu mới phải khác với mật khẩu cũ',
    },
    success: {
      title: 'Xác thực thành công!',
      subtitle: 'Đang chuyển hướng...',
    },
  },
  form: {
    codeDigitLabel: 'Chữ số xác thực',
    confirmPasswordLabel: 'Xác nhận mật khẩu mới',
    confirmPasswordPlaceholder: 'Nhập lại mật khẩu',
    emailLabel: 'Email',
    emailPlaceholder: 'name@company.com',
    hidePassword: 'Ẩn mật khẩu',
    passwordLabel: 'Mật khẩu mới',
    passwordPlaceholder: 'Ít nhất 8 ký tự',
    requestSubmit: 'Gửi mã đặt lại',
    codeContinueSubmit: 'Tiếp tục',
    resendPrefix: 'Gửi lại sau',
    resendAction: 'Gửi lại mã',
    resendingAction: 'Đang gửi lại...',
    resetSubmit: 'Lưu mật khẩu mới',
    sentSubmit: 'Nhập mã xác thực',
    showPassword: 'Hiện mật khẩu',
    verifySubmit: 'Xác thực',
  },
  validation: {
    codeRequired: 'Vui lòng nhập đủ mã 6 chữ số.',
    confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu mới.',
    emailRequired: 'Vui lòng nhập email.',
    emailInvalid: 'Email không hợp lệ.',
    passwordRequired: 'Vui lòng nhập mật khẩu mới.',
    passwordMinLength: 'Mật khẩu phải có ít nhất 8 ký tự.',
    passwordMismatch: 'Mật khẩu xác nhận không khớp.',
  },
}
