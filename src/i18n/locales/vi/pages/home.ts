import type { HomeTranslations } from '../../../types'

export const home: HomeTranslations = {
  states: {
    loading: 'Đang tải việc làm…',
    errorTitle: 'Không tải được mục này',
    errorDescription: 'Vui lòng tải lại trang hoặc thử lại sau giây lát.',
    emptyTitle: 'Chưa có dữ liệu',
    emptyDescription: 'Hiện chưa có kết quả phù hợp.',
  },
  hero: {
    eyebrow: 'Cơ hội nghề nghiệp',
    title: 'Tìm việc làm đúng với nhịp phát triển của bạn',
    description: 'Khám phá việc làm chất lượng từ các công ty đã xác thực, lọc nhanh theo địa điểm, mức lương và hình thức làm việc.',
    keywordLabel: 'Từ khóa công việc',
    keywordPlaceholder: 'Chức danh, kỹ năng hoặc công ty',
    locationLabel: 'Địa điểm',
    locationPlaceholder: 'Tất cả địa điểm',
    locationOptions: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Remote'],
    filterLabel: 'Mở bộ lọc',
    submit: 'Tìm kiếm',
    quickFilters: ['Remote', 'Hybrid', 'Senior', 'Lương 25M+'],
    stats: {
      openRoles: 'việc làm mở',
      companies: 'công ty xác thực',
      categories: 'nhóm nghề',
    },
    spotlight: {
      title: 'Đang tuyển mạnh',
      subtitle: 'Công ty có nhiều vị trí phù hợp trong tuần này',
    },
  },
  employers: {
    eyebrow: 'Đối tác tuyển dụng',
    title: 'Nhà tuyển dụng đang tăng tốc',
    viewAll: 'Xem tất cả',
  },
  jobs: {
    eyebrow: 'Danh sách việc làm',
    title: 'Việc làm phù hợp hôm nay',
    tabs: ['Phù hợp', 'Mới đăng', 'Lương cao'],
    loadMore: 'Xem thêm việc làm',
    saveLabel: 'Lưu việc làm',
  },
  categories: {
    eyebrow: 'Khám phá nhanh',
    title: 'Lọc theo nhóm nghề',
  },
  industryJobs: {
    eyebrow: 'Theo nhóm ngành',
    title: 'Cơ hội theo ngành',
    viewAll: 'Xem tất cả nhóm ngành',
    viewMore: 'Xem thêm',
    saveLabel: 'Lưu việc làm',
  },
  articles: {
    title: 'Cẩm nang nghề nghiệp',
    readMore: 'Đọc thêm',
    items: [
      {
        slug: 'stand-out-in-your-next-interview',
        category: 'Interview',
        description: 'Checklist chuẩn bị câu trả lời, câu hỏi ngược và cách follow-up sau buổi phỏng vấn.',
        title: 'Cách tạo ấn tượng trong buổi phỏng vấn tiếp theo',
        tone: 'coral',
        author: 'Mai Trần',
        authorRole: 'Trưởng phòng Tuyển dụng, Nexthire',
        date: 'Tháng 8, 2026',
        readingTime: '6 phút đọc',
        content: [
          {
            type: 'paragraph',
            text: 'Nhà tuyển dụng thường quyết định có thích một ứng viên hay không chỉ trong mười phút đầu tiên, và phần còn lại của buổi phỏng vấn chỉ để xác nhận lại cảm nhận đó. Chuẩn bị một cấu trúc trả lời rõ ràng là cách nhanh nhất để bạn chủ động tạo ấn tượng đầu tiên.',
          },
          { type: 'heading', text: 'Chuẩn bị với phương pháp STAR' },
          {
            type: 'paragraph',
            text: 'Các câu hỏi tình huống yêu cầu bạn chứng minh kỹ năng bằng một câu chuyện thật, không phải một định nghĩa. Phương pháp STAR — Tình huống, Nhiệm vụ, Hành động, Kết quả — giúp câu trả lời của bạn ngắn gọn và cụ thể, thay vì kể lể lại mô tả công việc.',
          },
          {
            type: 'list',
            items: [
              'Tình huống: mô tả bối cảnh trong một câu — đội nhóm, deadline, ràng buộc.',
              'Nhiệm vụ: nêu rõ kết quả bạn chịu trách nhiệm, không chỉ là chức danh.',
              'Hành động: mô tả hai, ba quyết định chỉ riêng bạn mới có thể đưa ra.',
              'Kết quả: kết thúc bằng một con số — thời gian tiết kiệm, doanh thu, tỷ lệ giữ chân hay mức độ áp dụng.',
            ],
          },
          { type: 'heading', text: "Đặt câu hỏi để 'phỏng vấn ngược' nhà tuyển dụng" },
          {
            type: 'paragraph',
            text: "Câu hỏi bạn đặt ra thể hiện cách bạn tư duy về vai trò này. Đừng hỏi 'văn hóa công ty thế nào', hãy hỏi cách đo lường thành công trong 90 ngày đầu, hoặc điều gì khiến người tiền nhiệm thành công hay rời đi. Câu hỏi này cho nhà tuyển dụng điều thật để trả lời, và cho bạn thông tin thật để quyết định.",
          },
          {
            type: 'quote',
            text: 'Những ứng viên nhận được offer là những người phỏng vấn ngược lại chúng tôi — họ đặt câu hỏi sắc hơn cả chúng tôi.',
            attribution: 'Quản lý tuyển dụng, công ty công nghệ quy mô vừa',
          },
          { type: 'heading', text: 'Follow-up đúng cách, không tỏ ra sốt ruột' },
          {
            type: 'paragraph',
            text: "Một email follow-up trong vòng 24 giờ là điều được kỳ vọng, không phải điểm cộng đặc biệt — vì vậy hãy làm cho nó hữu ích thay vì chỉ lịch sự. Nhắc đến một chi tiết cụ thể trong buổi trò chuyện và bổ sung điều bạn chưa kịp nói, thay vì chỉ lặp lại 'cảm ơn vì thời gian của anh/chị'.",
          },
          {
            type: 'list',
            items: [
              'Gửi trong vòng 24 giờ, cho tất cả người phỏng vấn nếu bạn có thông tin liên hệ.',
              'Nhắc đến một chi tiết trong buổi trò chuyện — chứng minh bạn thực sự lắng nghe.',
              'Bổ sung một điều bạn ước mình đã nói, gói gọn trong hai câu.',
              'Đặt một câu hỏi mở nếu bước tiếp theo chưa được xác nhận.',
            ],
          },
        ],
      },
      {
        slug: 'build-a-stronger-cv-in-30-minutes',
        category: 'CV',
        description: 'Cách trình bày thành tựu, kỹ năng và dự án để nhà tuyển dụng đọc nhanh hơn.',
        title: 'Xây dựng CV nổi bật trong 30 phút',
        tone: 'blue',
        author: 'Đức Nguyễn',
        authorRole: 'Chuyên viên Tuyển dụng, Nexthire',
        date: 'Tháng 8, 2026',
        readingTime: '5 phút đọc',
        content: [
          {
            type: 'paragraph',
            text: 'Hầu hết CV chỉ liệt kê nhiệm vụ. Những CV được mời phỏng vấn liệt kê kết quả. Nhà tuyển dụng dành chưa đến một phút cho lần đọc đầu tiên, vì vậy mỗi dòng phải trả lời được câu hỏi: điều gì đã thay đổi nhờ có bạn?',
          },
          { type: 'heading', text: 'Ưu tiên kết quả, không phải nhiệm vụ' },
          {
            type: 'paragraph',
            text: "Viết lại từng gạch đầu dòng để bắt đầu bằng điều đã xảy ra, không phải điều bạn được giao. 'Phụ trách onboarding nhân sự mới' không nói lên điều gì; 'Rút ngắn thời gian onboarding từ ba tuần xuống chín ngày' cho nhà tuyển dụng thấy chính xác năng lực bạn có thể lặp lại.",
          },
          {
            type: 'list',
            items: [
              "Trước: 'Quản lý các kênh mạng xã hội của thương hiệu.'",
              "Sau: 'Tăng gấp 3 lượt tiếp cận tự nhiên trong sáu tháng trên ba kênh.'",
              "Trước: 'Phụ trách xử lý ticket hỗ trợ khách hàng.'",
              "Sau: 'Giảm thời gian phản hồi trung bình từ 6 giờ xuống 45 phút.'",
            ],
          },
          { type: 'heading', text: 'Cắt gọn còn phần nhà tuyển dụng thực sự đọc' },
          {
            type: 'paragraph',
            text: 'Mắt của nhà tuyển dụng di chuyển theo hình chữ F: chức danh, tên công ty, và dòng đầu tiên của mỗi gạch đầu dòng. Hãy đặt thành tựu mạnh nhất lên đầu mỗi phần, và cắt bỏ những gì quá 10 năm trừ khi thực sự liên quan.',
          },
          {
            type: 'quote',
            text: 'Tôi không đọc CV từ trên xuống dưới. Tôi lướt qua mép trái, rồi quyết định phần còn lại có đáng đọc không.',
            attribution: 'Chuyên viên tuyển dụng, công ty SaaS',
          },
          { type: 'heading', text: 'Định dạng phù hợp cho cả người đọc lẫn ATS' },
          {
            type: 'paragraph',
            text: 'Hệ thống lọc CV tự động (ATS) đọc tốt nhất với cấu trúc đơn giản: tiêu đề mục chuẩn, không bảng biểu hay text box, chỉ một cột. Hãy lưu một bản đơn giản để nộp online, và một bản thiết kế đẹp để gửi trực tiếp hoặc dùng khi phỏng vấn.',
          },
          {
            type: 'list',
            items: [
              'Dùng tiêu đề chuẩn: Kinh nghiệm, Học vấn, Kỹ năng.',
              'Tránh bảng biểu, chia cột, hình ảnh mà ATS không đọc được.',
              'Giữ trong 1 trang nếu dưới 5 năm kinh nghiệm, 2 trang nếu nhiều hơn.',
              'Khớp từ khóa từ tin tuyển dụng — đúng cách diễn đạt, không chỉ từ đồng nghĩa.',
            ],
          },
        ],
      },
      {
        slug: 'sustainable-career-growth-strategies',
        category: 'Growth',
        description: 'Nhận diện thời điểm chuyển vai trò, thương lượng lương và xây dựng kế hoạch học tập.',
        title: 'Chiến lược phát triển sự nghiệp bền vững',
        tone: 'green',
        author: 'Linh Phạm',
        authorRole: 'Career Coach, Nexthire',
        date: 'Tháng 8, 2026',
        readingTime: '7 phút đọc',
        content: [
          {
            type: 'paragraph',
            text: 'Sự phát triển sự nghiệp hiếm khi là một đường thẳng. Nó là một chuỗi quyết định được đưa ra khi bạn chưa cảm thấy hoàn toàn sẵn sàng — về thời điểm chuyển vai trò, thời điểm đề nghị nhiều hơn, và điều tiếp theo cần học. Chờ đến khi chắc chắn tuyệt đối thường đồng nghĩa với việc chờ quá lâu.',
          },
          { type: 'heading', text: 'Nhận biết thời điểm cần chuyển vai trò' },
          {
            type: 'paragraph',
            text: 'Tín hiệu rõ ràng nhất không phải là sự nhàm chán — mà là khoảng cách ngày càng thu hẹp giữa điều bạn được giao và điều bạn có khả năng làm. Nếu ba dự án gần nhất giống lặp lại hơn là thử thách, khoảng cách đó đã đóng lại.',
          },
          {
            type: 'list',
            items: [
              "Bạn có thể làm công việc này gần như 'nhắm mắt' hầu hết các ngày.",
              'Không ai trong đội có thể dạy bạn điều mới trong chuyên môn cốt lõi.',
              'Bạn đã ngừng xin phản hồi vì đã biết trước câu trả lời.',
              'Đợt thăng tiến tiếp theo trên lộ trình hiện tại còn cách hơn một năm.',
            ],
          },
          { type: 'heading', text: 'Đàm phán bằng bằng chứng, không phải cảm xúc' },
          {
            type: 'paragraph',
            text: 'Cuộc trò chuyện về lương diễn ra tốt hơn khi bạn mang theo một con số và một lý do, không phải một cảm giác. Hãy tìm hiểu mức lương thị trường cho vai trò và cấp bậc của bạn, sau đó neo cuộc trò chuyện vào tác động cụ thể — một dự án đã hoàn thành, một mục tiêu đã đạt, một quy trình bạn xây dựng mà người khác đang dựa vào.',
          },
          {
            type: 'quote',
            text: 'Những người được tăng lương là những người trình bày lý do trước khi đưa ra con số.',
            attribution: 'Trưởng bộ phận nhân sự, startup giai đoạn tăng trưởng',
          },
          { type: 'heading', text: 'Xây dựng kế hoạch học tập trong 12 tháng' },
          {
            type: 'paragraph',
            text: 'Sự phát triển tích lũy khi được lên kế hoạch, không phải khi để nó tình cờ xảy ra. Chọn một kỹ năng giúp công việc hiện tại dễ dàng hơn, và một kỹ năng mở ra vai trò tiếp theo, sau đó dành thời gian cố định mỗi tuần cho cả hai, thay vì hy vọng các khóa học hay hội thảo sẽ tự sắp xếp được.',
          },
          {
            type: 'list',
            items: [
              'Một kỹ năng cho vai trò hiện tại — giúp công việc năm nay dễ dàng hơn.',
              'Một kỹ năng cho vai trò tiếp theo — giúp bước chuyển năm sau khả thi.',
              'Một khung giờ cố định mỗi tuần, dù chỉ 90 phút, tốt hơn học dồn thỉnh thoảng.',
              'Một điểm kiểm tra mỗi quý để đối chiếu điều đã học với công việc thực tế.',
            ],
          },
        ],
      },
    ],
  },
  newsletter: {
    eyebrow: 'Nhận việc làm mới',
    title: 'Thiết lập job alert theo đúng mục tiêu',
    description: 'Nhận email hằng tuần về việc làm mới, lương tốt và nội dung nghề nghiệp hữu ích.',
    emailLabel: 'Email nhận thông báo',
    emailPlaceholder: 'Email của bạn',
    emailHelper: 'Mỗi tuần một email. Bạn có thể hủy bất cứ lúc nào.',
    submit: 'Đăng ký',
    chips: ['Engineering', 'Remote', '25M+', 'Senior'],
    mockTitle: 'Bản tin phù hợp',
    mockLines: ['4 việc làm mới từ công ty đã xác thực', '2 vị trí remote có mức lương phù hợp', 'Checklist phỏng vấn cho tuần này'],
  },
}
