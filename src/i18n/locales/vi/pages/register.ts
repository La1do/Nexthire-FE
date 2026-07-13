export const register = {
  title: 'Tạo tài khoản mới',
  subtitle: 'Bắt đầu hành trình tuyển dụng cùng NexHire',
  form: {
    roleLabel: 'Tôi là',
    roleOptions: [
      { value: 'candidate', label: 'Ứng viên' },
      { value: 'employer', label: 'Nhà tuyển dụng' },
    ],
    emailLabel: 'Email',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Ít nhất 8 ký tự',
    confirmPasswordLabel: 'Xác nhận mật khẩu',
    confirmPasswordPlaceholder: 'Nhập lại mật khẩu',
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    submit: 'Đăng ký',
  },
  footer: {
    prompt: 'Đã có tài khoản?',
    action: 'Đăng nhập',
  },
  validation: {
    emailRequired: 'Vui lòng nhập email.',
    emailInvalid: 'Email không hợp lệ.',
    passwordRequired: 'Vui lòng nhập mật khẩu.',
    passwordMinLength: 'Mật khẩu phải có ít nhất 8 ký tự.',
    confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu.',
    passwordMismatch: 'Mật khẩu xác nhận không khớp.',
  },
}
