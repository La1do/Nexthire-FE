import type { PropsWithChildren } from 'react'

// Layout tối giản: render children chiếm trọn màn hình, không header/footer
// hay container giới hạn bề rộng. Dùng cho các trang full-screen như CV Builder.
export function BlankLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
