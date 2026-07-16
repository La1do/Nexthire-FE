export const login = {
  title: 'Chào mừng trở lại',
  subtitle: 'Đăng nhập để tiếp tục với NexHire',
  form: {
    roleLabel: 'Đăng nhập với vai trò',
    roleOptions: [
      { value: 'candidate', label: 'Ứng viên' },
      { value: 'employer', label: 'Nhà tuyển dụng' },
    ],
    emailLabel: 'Email',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    submit: 'Đăng nhập',
    submitLoading: 'Đang đăng nhập...',
  },
  footer: {
    prompt: 'Chưa có tài khoản?',
    action: 'Đăng ký ngay',
  },
  validation: {
    emailRequired: 'Vui lòng nhập email.',
    emailInvalid: 'Email không hợp lệ.',
    passwordRequired: 'Vui lòng nhập mật khẩu.',
  },
}
