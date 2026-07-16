import type { AdminCompany, AdminCompanyStats } from '../types'

export const adminCompaniesFixture: ReadonlyArray<AdminCompany> = [
  {
    id: 'fpt-software',
    name: 'FPT Software',
    website: 'https://fpt.com.vn',
    taxCode: '0101092557',
    address: 'Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội',
    submittedAt: '10/06/2026',
    status: 'approved',
    description:
      'FPT Software là công ty cung cấp dịch vụ phần mềm lớn tại Việt Nam, vận hành nhiều trung tâm công nghệ và phục vụ khách hàng ở hơn 25 quốc gia.',
    logoText: 'FS',
    stats: {
      jobPosts: 12,
      applicants: 348,
      responseRate: 87,
    },
    documents: [
      { id: 'fpt-license', name: 'Giấy phép kinh doanh.pdf', href: '#' },
      { id: 'fpt-id', name: 'Xác nhận địa chỉ.pdf', href: '#' },
      { id: 'fpt-tax', name: 'Mã số thuế.pdf', href: '#' },
    ],
  },
  {
    id: 'vng-corporation',
    name: 'VNG Corporation',
    website: 'https://vng.com.vn',
    taxCode: '0305046979',
    address: 'Z06, Đường 13, Tân Thuận Đông, Quận 7, TP. HCM',
    submittedAt: '12/06/2026',
    status: 'pending',
    description:
      'VNG phát triển các sản phẩm nền tảng số, trò chơi trực tuyến, thanh toán và dịch vụ đám mây cho thị trường Việt Nam và khu vực.',
    logoText: 'VN',
    stats: {
      jobPosts: 8,
      applicants: 214,
      responseRate: 79,
    },
    documents: [
      { id: 'vng-license', name: 'Business registration.pdf', href: '#' },
      { id: 'vng-tax', name: 'Tax certificate.pdf', href: '#' },
      { id: 'vng-brand', name: 'Brand authorization.pdf', href: '#' },
    ],
  },
  {
    id: 'tiki-corporation',
    name: 'Tiki Corporation',
    website: 'https://tiki.vn',
    taxCode: '0309532909',
    address: '52 Út Tịch, Phường 4, Tân Bình, TP. HCM',
    submittedAt: '13/06/2026',
    status: 'pending',
    description:
      'Tiki xây dựng hệ sinh thái thương mại điện tử, logistics và dịch vụ khách hàng với trọng tâm là trải nghiệm mua sắm đáng tin cậy.',
    logoText: 'TK',
    stats: {
      jobPosts: 6,
      applicants: 176,
      responseRate: 73,
    },
    documents: [
      { id: 'tiki-license', name: 'Giấy đăng ký doanh nghiệp.pdf', href: '#' },
      { id: 'tiki-location', name: 'Xác nhận trụ sở.pdf', href: '#' },
    ],
  },
  {
    id: 'shopee-vietnam',
    name: 'Shopee Vietnam',
    website: 'https://shopee.vn',
    taxCode: '0313287523',
    address: 'Tòa nhà Saigon Centre, Quận 1, TP. HCM',
    submittedAt: '14/06/2026',
    status: 'rejected',
    description:
      'Shopee Vietnam vận hành nền tảng thương mại điện tử và dịch vụ hỗ trợ người bán trên toàn quốc.',
    logoText: 'SH',
    stats: {
      jobPosts: 3,
      applicants: 92,
      responseRate: 58,
    },
    documents: [
      { id: 'shopee-license', name: 'Giấy phép kinh doanh.pdf', href: '#' },
      { id: 'shopee-tax', name: 'Thông tin thuế.pdf', href: '#' },
    ],
  },
  {
    id: 'momo-e-wallet',
    name: 'MoMo E-Wallet',
    website: 'https://momo.vn',
    taxCode: '0312898480',
    address: 'Tòa nhà Phú Mỹ Hưng Tower, Quận 7, TP. HCM',
    submittedAt: '15/06/2026',
    status: 'pending',
    description:
      'MoMo phát triển ví điện tử, thanh toán số và các dịch vụ tài chính tiêu dùng cho hàng chục triệu người dùng tại Việt Nam.',
    logoText: 'MM',
    stats: {
      jobPosts: 10,
      applicants: 265,
      responseRate: 81,
    },
    documents: [
      { id: 'momo-license', name: 'Enterprise registration.pdf', href: '#' },
      { id: 'momo-finance', name: 'Financial service license.pdf', href: '#' },
      { id: 'momo-tax', name: 'Tax document.pdf', href: '#' },
    ],
  },
  {
    id: 'grab-vietnam',
    name: 'Grab Vietnam',
    website: 'https://grab.com/vn',
    taxCode: '0312650437',
    address: 'Mapletree Business Centre, Quận 7, TP. HCM',
    submittedAt: '16/06/2026',
    status: 'approved',
    description:
      'Grab Vietnam cung cấp nền tảng di chuyển, giao nhận và dịch vụ tài chính số cho người dùng và đối tác tài xế.',
    logoText: 'GR',
    stats: {
      jobPosts: 14,
      applicants: 401,
      responseRate: 91,
    },
    documents: [
      { id: 'grab-license', name: 'Company profile.pdf', href: '#' },
      { id: 'grab-tax', name: 'Tax verification.pdf', href: '#' },
    ],
  },
  {
    id: 'one-mount-group',
    name: 'One Mount Group',
    website: 'https://onemount.com',
    taxCode: '0109123432',
    address: 'Times City, Hai Bà Trưng, Hà Nội',
    submittedAt: '18/06/2026',
    status: 'pending',
    description:
      'One Mount Group xây dựng các nền tảng công nghệ cho bán lẻ, bất động sản, tài chính và dữ liệu khách hàng.',
    logoText: 'OM',
    stats: {
      jobPosts: 7,
      applicants: 188,
      responseRate: 76,
    },
    documents: [
      { id: 'om-license', name: 'Giấy phép doanh nghiệp.pdf', href: '#' },
      { id: 'om-address', name: 'Xác minh địa chỉ.pdf', href: '#' },
    ],
  },
  {
    id: 'be-group',
    name: 'Be Group',
    website: 'https://be.com.vn',
    taxCode: '0315664398',
    address: 'Tòa nhà Viettel Complex, Quận 10, TP. HCM',
    submittedAt: '20/06/2026',
    status: 'rejected',
    description:
      'Be Group vận hành nền tảng gọi xe, giao hàng và dịch vụ đô thị theo mô hình công nghệ Việt Nam.',
    logoText: 'BE',
    stats: {
      jobPosts: 2,
      applicants: 61,
      responseRate: 44,
    },
    documents: [
      { id: 'be-license', name: 'Registration.pdf', href: '#' },
      { id: 'be-tax', name: 'Tax code.pdf', href: '#' },
    ],
  },
]

export function computeCompanyStats(companies: ReadonlyArray<AdminCompany>): AdminCompanyStats {
  let pending = 0
  let approved = 0
  let rejected = 0

  for (const company of companies) {
    if (company.status === 'pending') pending += 1
    if (company.status === 'approved') approved += 1
    if (company.status === 'rejected') rejected += 1
  }

  return { pending, approved, rejected }
}
