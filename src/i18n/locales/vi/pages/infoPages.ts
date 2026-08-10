export const infoPages = {
  pages: {
    latestJobs: {
      badge: 'Trang thông tin',
      hero: {
        eyebrow: 'Việc làm mới nhất',
        title: 'Cập nhật cơ hội nghề nghiệp mỗi ngày',
        description:
          'Tổng hợp các vị trí vừa được đăng tải trên NexHire, sắp xếp theo thời gian để bạn không bỏ lỡ cơ hội ứng tuyển sớm nhất.',
      },
      intro:
        'Danh sách dưới đây được làm mới liên tục từ các công ty đã được xác minh trên NexHire. Bạn có thể mở trang Tìm việc để lọc theo ngành, địa điểm và mức lương phù hợp.',
      sections: [
        {
          title: 'Cách chúng tôi cập nhật danh sách',
          description:
            'Mỗi khi nhà tuyển dụng đăng hoặc gia hạn tin, vị trí sẽ tự động xuất hiện ở đầu danh sách. Tin đã hết hạn sẽ được chuyển sang mục việc làm đã đóng.',
          bullets: [
            'Tin mới đăng hiển thị trong vòng 5 phút.',
            'Tin được gia hạn giữ nguyên lịch sử đăng ban đầu.',
            'Vị trí đã đóng ứng tuyển không thể nộp thêm.',
          ],
        },
        {
          title: 'Lời khuyên để ứng tuyển hiệu quả',
          description:
            'Hồ sơ đầy đủ và CV được cá nhân hoá giúp tăng tỷ lệ được nhà tuyển dụng phản hồi trong vòng 7 ngày.',
          bullets: [
            'Cập nhật hồ sơ với vị trí mong muốn và mức lương kỳ vọng.',
            'Đính kèm thư xin việc ngắn gọn cho từng ngành.',
            'Bật thông báo email để nhận việc làm mới theo bộ lọc.',
          ],
        },
      ],
      cta: {
        title: 'Sẵn sàng khám phá việc làm mới nhất?',
        description: 'Mở trang Tìm việc để xem toàn bộ danh sách đang được tuyển.',
        primaryLabel: 'Đi đến trang Tìm việc',
        primaryHref: '/search',
        secondaryLabel: 'Tạo hồ sơ ứng viên',
        secondaryHref: '/register',
      },
    },
    itJobs: {
      badge: 'Trang thông tin',
      hero: {
        eyebrow: 'Việc làm IT',
        title: 'Cơ hội cho lập trình viên, kỹ sư và chuyên gia công nghệ',
        description:
          'Tuyển tập các vị trí IT đang được đăng tuyển trên NexHire, từ frontend, backend, mobile, DevOps đến AI/ML và quản lý sản phẩm.',
      },
      intro:
        'Trang này giới thiệu sơ lược về nhóm việc làm IT. Để xem danh sách chi tiết kèm bộ lọc theo ngôn ngữ lập trình và mức kinh nghiệm, bạn có thể mở trang Tìm việc và chọn nhóm IT.',
      sections: [
        {
          title: 'Các nhóm vị trí IT phổ biến',
          description:
            'Danh mục được phân nhóm theo chức năng để bạn nhanh chóng xác định công việc phù hợp với chuyên môn của mình.',
          bullets: [
            'Frontend / Backend / Fullstack',
            'Mobile (iOS, Android, React Native, Flutter)',
            'DevOps, SRE, Cloud và Data Engineering',
            'AI/ML, Data Science và phân tích dữ liệu',
            'Quản lý sản phẩm, thiết kế UX/UI và QA',
          ],
        },
        {
          title: 'Kỹ năng thường được yêu cầu',
          description:
            'Mỗi vị trí đều liệt kê công nghệ cốt lõi. Bạn nên đối chiếu với hồ sơ cá nhân trước khi ứng tuyển để tăng cơ hội được phản hồi.',
          bullets: [
            'TypeScript, React, Node.js cho web hiện đại.',
            'Java, Spring Boot cho hệ thống doanh nghiệp.',
            'AWS, Docker, Kubernetes cho hạ tầng đám mây.',
            'SQL và các cơ sở dữ liệu quan hệ là yêu cầu phổ biến.',
          ],
        },
      ],
      cta: {
        title: 'Xem danh sách việc làm IT',
        description: 'Dùng bộ lọc IT trên trang Tìm việc để thu hẹp theo công nghệ và cấp bậc.',
        primaryLabel: 'Lọc việc IT',
        primaryHref: '/search',
        secondaryLabel: 'Tải mẫu CV IT',
        secondaryHref: '/cv-templates',
      },
    },
    marketingJobs: {
      badge: 'Trang thông tin',
      hero: {
        eyebrow: 'Việc làm Marketing',
        title: 'Cơ hội cho chuyên viên marketing, content và growth',
        description:
          'Tổng hợp vị trí marketing đa dạng từ content, SEO, performance marketing đến brand và truyền thông trên NexHire.',
      },
      intro:
        'Marketing trên NexHire bao gồm cả chuyên viên thực thi lẫn quản lý cấp trung. Mở trang Tìm việc để xem các vị trí mới nhất theo từng nhóm.',
      sections: [
        {
          title: 'Các nhóm vị trí marketing tiêu biểu',
          description:
            'Chọn nhóm phù hợp với thế mạnh của bạn, từ sáng tạo nội dung đến phân tích dữ liệu và quản lý chiến dịch.',
          bullets: [
            'Content marketing, copywriting và biên tập.',
            'Performance marketing, ads và tối ưu chuyển đổi.',
            'SEO, social media và cộng đồng.',
            'Brand, PR và truyền thông nội bộ.',
            'Product marketing và growth.',
          ],
        },
        {
          title: 'Kinh nghiệm và công cụ thường gặp',
          description:
            'Hầu hết vị trí yêu cầu bạn đã quen thuộc với một số công cụ phân tích và quản lý chiến dịch phổ biến.',
          bullets: [
            'Google Analytics, Google Tag Manager, Meta Ads.',
            'Công cụ SEO như Ahrefs, SEMrush hoặc các giải pháp tương đương.',
            'CRM và email marketing (HubSpot, Mailchimp...).',
            'Kinh nghiệm viết content đa kênh và đo lường KPI.',
          ],
        },
      ],
      cta: {
        title: 'Khám phá việc làm marketing mới nhất',
        description: 'Dùng bộ lọc theo nhóm ngành trên trang Tìm việc để tìm cơ hội phù hợp.',
        primaryLabel: 'Xem việc Marketing',
        primaryHref: '/search',
      },
    },
    postJob: {
      badge: 'Dành cho nhà tuyển dụng',
      hero: {
        eyebrow: 'Đăng tin tuyển dụng',
        title: 'Tiếp cận hàng nghìn ứng viên chất lượng',
        description:
          'Đăng tin trên NexHire giúp bạn tiếp cận cộng đồng ứng viên đã xác minh email và có hồ sơ đầy đủ.',
      },
      intro:
        'Trang này tóm tắt quy trình đăng tin và các bước cần chuẩn bị trước khi mở form đăng tuyển. Nếu bạn chưa có tài khoản nhà tuyển dụng, hãy đăng ký trước.',
      sections: [
        {
          title: 'Chuẩn bị trước khi đăng tin',
          description:
            'Hồ sơ công ty rõ ràng giúp tin đăng của bạn được duyệt nhanh hơn và nhận được nhiều ứng viên quan tâm hơn.',
          bullets: [
            'Hoàn tất xác minh doanh nghiệp với mã số thuế và website chính thức.',
            'Chuẩn bị mô tả công việc, yêu cầu và quyền lợi bằng tiếng Việt.',
            'Xác định rõ mức lương tối thiểu hoặc mức thỏa thuận.',
            'Chọn hình thức làm việc: tại văn phòng, remote hoặc hybrid.',
          ],
        },
        {
          title: 'Quy trình đăng tin',
          description:
            'Sau khi bấm "Đăng tin mới", tin của bạn sẽ được hệ thống kiểm duyệt tự động và hiển thị công khai trong vòng vài phút nếu đạt yêu cầu.',
          bullets: [
            'Tạo tin ở trang quản lý dành cho nhà tuyển dụng.',
            'Hệ thống kiểm tra nội dung và gắn nhãn rủi ro (nếu có).',
            'Tin đạt yêu cầu sẽ được đăng ngay và bắt đầu nhận hồ sơ.',
            'Bạn có thể chỉnh sửa, tạm dừng hoặc đóng tin bất kỳ lúc nào.',
          ],
        },
        {
          title: 'Gợi ý để thu hút ứng viên',
          description:
            'Tin tuyển dụng có cấu trúc rõ ràng và công bằng thường nhận được nhiều hồ sơ chất lượng hơn.',
          bullets: [
            'Nêu rõ trách nhiệm chính và chỉ tiêu đánh giá.',
            'Công khai mức lương hoặc khoảng lương dự kiến.',
            'Mô tả văn hoá công ty và quy trình phỏng vấn.',
            'Phản hồi ứng viên trong vòng 7 ngày làm việc.',
          ],
        },
      ],
      cta: {
        title: 'Bắt đầu đăng tin ngay',
        description: 'Đăng nhập bằng tài khoản nhà tuyển dụng để mở form tạo tin tuyển dụng.',
        primaryLabel: 'Đăng nhập nhà tuyển dụng',
        primaryHref: '/recruiter/login',
        secondaryLabel: 'Đăng ký tài khoản nhà tuyển dụng',
        secondaryHref: '/recruiter/register',
      },
    },
    businessHiring: {
      badge: 'Dành cho doanh nghiệp',
      hero: {
        eyebrow: 'Đồng hành doanh nghiệp',
        title: 'Giải pháp tuyển dụng cho quy mô lớn',
        description:
          'NexHire hỗ trợ doanh nghiệp xây dựng quy trình tuyển dụng hiệu quả, từ xác minh hồ sơ đến báo cáo toàn diện.',
      },
      intro:
        'Trang này dành cho đội ngũ HR và ban lãnh đạo doanh nghiệp đang tìm kiếm giải pháp tuyển dụng dài hạn, với yêu cầu tuỳ biến cao và hỗ trợ trực tiếp.',
      sections: [
        {
          title: 'Những gì chúng tôi hỗ trợ',
          description:
            'Ngoài đăng tin, doanh nghiệp có thể tận dụng các công cụ hỗ trợ sàng lọc và quản lý hồ sơ ứng viên.',
          bullets: [
            'Xác minh email và hồ sơ ứng viên trước khi vào vòng phỏng vấn.',
            'Bảng điều khiển theo dõi tỷ lệ chuyển đổi của từng vị trí.',
            'Hỗ trợ lọc ứng viên bằng AI và gợi ý ứng viên phù hợp.',
            'Đội ngũ hỗ trợ riêng cho doanh nghiệp tuyển số lượng lớn.',
          ],
        },
        {
          title: 'Cách bắt đầu hợp tác',
          description:
            'Bạn không cần ký hợp đồng ngay từ đầu. Hãy đăng ký tài khoản doanh nghiệp và trải nghiệm các công cụ miễn phí trước.',
          bullets: [
            'Đăng ký tài khoản nhà tuyển dụng và xác minh doanh nghiệp.',
            'Đăng thử một vài vị trí để đánh giá chất lượng hồ sơ.',
            'Trao đổi với đội ngũ NexHire để được tư vấn gói phù hợp.',
          ],
        },
      ],
      cta: {
        title: 'Liên hệ đội ngũ NexHire',
        description: 'Gửi email cho chúng tôi để được tư vấn gói đồng hành phù hợp với quy mô công ty bạn.',
        primaryLabel: 'Gửi email hợp tác',
        primaryHref: 'mailto:nexhire.team.support@gmail.com',
        secondaryLabel: 'Tìm hiểu thêm',
        secondaryHref: '/contact',
      },
    },
    helpCenter: {
      badge: 'Hỗ trợ',
      hero: {
        eyebrow: 'Trung tâm trợ giúp',
        title: 'Câu hỏi thường gặp và hướng dẫn sử dụng',
        description:
          'Tổng hợp các câu hỏi phổ biến từ ứng viên và nhà tuyển dụng, cùng hướng dẫn từng bước để bạn sử dụng NexHire hiệu quả.',
      },
      intro:
        'Nếu bạn không tìm thấy câu trả lời phù hợp, hãy liên hệ đội ngũ hỗ trợ qua email hoặc trang Liên hệ.',
      sections: [
        {
          title: 'Dành cho ứng viên',
          description: 'Các bước cơ bản để tìm việc và ứng tuyển trên NexHire.',
          bullets: [
            'Tạo tài khoản và xác minh email trong vài phút.',
            'Hoàn thiện hồ sơ để tăng độ hiển thị với nhà tuyển dụng.',
            'Dùng bộ lọc ở trang Tìm việc để thu hẹp kết quả.',
            'Theo dõi trạng thái hồ sơ trong mục Hồ sơ của tôi.',
          ],
        },
        {
          title: 'Dành cho nhà tuyển dụng',
          description: 'Quy trình xác minh doanh nghiệp và đăng tin tuyển dụng.',
          bullets: [
            'Đăng ký tài khoản nhà tuyển dụng riêng.',
            'Chuẩn bị mã số thuế và website để hoàn tất xác minh.',
            'Sau khi được duyệt, bạn có thể đăng tin không giới hạn.',
            'Dùng bảng điều khiển để theo dõi và phản hồi ứng viên.',
          ],
        },
        {
          title: 'Bảo mật và quyền riêng tư',
          description:
            'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật.',
          bullets: [
            'Mật khẩu được mã hoá và không lưu dạng văn bản thuần.',
            'Chỉ bạn và nhà tuyển dụng được cấp quyền xem hồ sơ của bạn.',
            'Bạn có thể yêu cầu xoá tài khoản bất kỳ lúc nào.',
          ],
        },
      ],
      cta: {
        title: 'Vẫn cần hỗ trợ?',
        description: 'Đội ngũ NexHire sẵn sàng giải đáp qua email hoặc trang Liên hệ.',
        primaryLabel: 'Liên hệ hỗ trợ',
        primaryHref: '/contact',
      },
    },
    contact: {
      badge: 'Liên hệ',
      hero: {
        eyebrow: 'Liên hệ',
        title: 'Kết nối với đội ngũ NexHire',
        description:
          'Mọi góp ý, yêu cầu hỗ trợ hoặc đề xuất hợp tác đều được chúng tôi tiếp nhận và phản hồi trong thời gian sớm nhất.',
      },
      intro:
        'Trang này tổng hợp các kênh liên hệ chính thức của NexHire. Vui lòng chọn kênh phù hợp với nhu cầu của bạn.',
      sections: [
        {
          title: 'Email hỗ trợ',
          description:
            'Sử dụng email hỗ trợ cho các vấn đề về tài khoản, hồ sơ, đăng tin hoặc báo cáo nội dung.',
          bullets: [
            'Hỗ trợ chung: nexhire.team.support@gmail.com',
            'Phản hồi trong vòng 1-2 ngày làm việc.',
            'Vui lòng kèm theo ảnh chụp màn hình nếu có lỗi giao diện.',
          ],
        },
        {
          title: 'Hợp tác doanh nghiệp',
          description:
            'Nếu bạn muốn triển khai giải pháp tuyển dụng cho đội ngũ lớn, vui lòng gửi email kèm thông tin công ty.',
          bullets: [
            'Mô tả ngắn về quy mô và ngành nghề.',
            'Số lượng vị trí dự kiến tuyển trong 3 tháng tới.',
            'Người phụ trách và thông tin liên hệ.',
          ],
        },
        {
          title: 'Phản hồi và góp ý',
          description:
            'Chúng tôi trân trọng mọi góp ý để cải thiện sản phẩm. Bạn có thể gửi ý tưởng hoặc báo lỗi qua email.',
          bullets: [
            'Góp ý tính năng mới.',
            'Báo cáo nội dung không phù hợp.',
            'Đánh giá trải nghiệm sử dụng.',
          ],
        },
      ],
      cta: {
        title: 'Gửi email cho chúng tôi',
        description: 'Đội ngũ NexHire sẽ phản hồi trong thời gian sớm nhất.',
        primaryLabel: 'Mở email hỗ trợ',
        primaryHref: 'mailto:nexhire.team.support@gmail.com',
        secondaryLabel: 'Xem câu hỏi thường gặp',
        secondaryHref: '/help',
      },
    },
    privacyPolicy: {
      badge: 'Pháp lý',
      hero: {
        eyebrow: 'Chính sách bảo mật',
        title: 'Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn',
        description:
          'Chính sách bảo mật dưới đây mô tả các loại thông tin NexHire thu thập, mục đích sử dụng và quyền của bạn đối với dữ liệu cá nhân.',
      },
      intro:
        'Bằng việc sử dụng NexHire, bạn đồng ý với các điều khoản trong chính sách này. Vui lòng đọc kỹ trước khi tạo tài khoản hoặc đăng tin.',
      sections: [
        {
          title: 'Thông tin chúng tôi thu thập',
          description:
            'Chúng tôi chỉ thu thập các thông tin cần thiết để cung cấp dịch vụ và cải thiện trải nghiệm người dùng.',
          bullets: [
            'Thông tin tài khoản: họ tên, email, số điện thoại (nếu cung cấp).',
            'Hồ sơ năng lực: kỹ năng, kinh nghiệm, CV tải lên.',
            'Thông tin doanh nghiệp đối với nhà tuyển dụng: tên, mã số thuế, địa chỉ.',
            'Nhật ký truy cập và dữ liệu thiết bị phục vụ bảo mật.',
          ],
        },
        {
          title: 'Mục đích sử dụng',
          description:
            'Dữ liệu của bạn được sử dụng để vận hành dịch vụ và không được bán cho bên thứ ba vì mục đích thương mại.',
          bullets: [
            'Kết nối ứng viên với nhà tuyển dụng phù hợp.',
            'Gửi thông báo quan trọng về tài khoản và dịch vụ.',
            'Phát hiện và ngăn chặn các hành vi lạm dụng.',
            'Cải thiện chất lượng sản phẩm qua phân tích ẩn danh.',
          ],
        },
        {
          title: 'Quyền của bạn',
          description:
            'Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình trên NexHire.',
          bullets: [
            'Yêu cầu truy xuất và chỉnh sửa thông tin bất kỳ lúc nào.',
            'Yêu cầu xoá tài khoản và toàn bộ dữ liệu liên quan.',
            'Từ chối nhận email tiếp thị mà vẫn giữ các thông báo cần thiết.',
            'Liên hệ đội ngũ bảo mật nếu phát hiện hành vi sử dụng trái phép.',
          ],
        },
        {
          title: 'Thời hạn lưu trữ',
          description:
            'Dữ liệu được lưu trữ trong thời gian tài khoản còn hoạt động hoặc theo yêu cầu của pháp luật.',
          bullets: [
            'Sau khi bạn yêu cầu xoá, dữ liệu sẽ được gỡ khỏi hệ thống trong vòng 30 ngày.',
            'Một số bản ghi có thể được giữ lại ở dạng ẩn danh phục vụ thống kê.',
          ],
        },
      ],
      cta: {
        title: 'Có thắc mắc về quyền riêng tư?',
        description: 'Liên hệ đội ngũ NexHire nếu bạn cần làm rõ thêm về chính sách bảo mật.',
        primaryLabel: 'Gửi email',
        primaryHref: 'mailto:nexhire.team.support@gmail.com',
        secondaryLabel: 'Xem điều khoản',
        secondaryHref: '/terms',
      },
    },
    terms: {
      badge: 'Pháp lý',
      hero: {
        eyebrow: 'Điều khoản sử dụng',
        title: 'Quy tắc và điều kiện khi sử dụng NexHire',
        description:
          'Điều khoản sử dụng dưới đây là thoả thuận giữa bạn và NexHire về cách dịch vụ được cung cấp và sử dụng.',
      },
      intro:
        'Khi tạo tài khoản hoặc sử dụng bất kỳ tính năng nào trên NexHire, bạn đồng ý tuân thủ các điều khoản dưới đây.',
      sections: [
        {
          title: 'Tài khoản của bạn',
          description:
            'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động xảy ra dưới tài khoản của mình.',
          bullets: [
            'Cung cấp thông tin chính xác khi đăng ký và cập nhật khi có thay đổi.',
            'Không chia sẻ tài khoản cho người khác sử dụng.',
            'Thông báo ngay cho NexHire nếu phát hiện truy cập trái phép.',
          ],
        },
        {
          title: 'Nội dung do người dùng đăng tải',
          description:
            'Bạn giữ quyền sở hữu nội dung đăng tải nhưng cấp cho NexHire quyền sử dụng hợp lý để vận hành dịch vụ.',
          bullets: [
            'Không đăng tải nội dung vi phạm pháp luật, xúc phạm hoặc gây hiểu lầm.',
            'Không sử dụng NexHire để lừa đảo, quấy rối hoặc spam.',
            'NexHire có quyền gỡ bỏ nội dung vi phạm và tạm khóa tài khoản khi cần.',
          ],
        },
        {
          title: 'Quyền và trách nhiệm của NexHire',
          description:
            'Chúng tôi cam kết cung cấp dịch vụ ổn định và minh bạch, đồng thời có quyền giới hạn truy cập khi cần bảo trì hoặc vi phạm điều khoản.',
          bullets: [
            'Duy trì hệ thống, bảo mật dữ liệu và hỗ trợ người dùng.',
            'Có thể tạm ngưng dịch vụ để bảo trì và sẽ thông báo trước khi có thể.',
            'Không chịu trách nhiệm về nội dung do người dùng cung cấp.',
          ],
        },
        {
          title: 'Thay đổi điều khoản',
          description:
            'Chúng tôi có thể cập nhật điều khoản để phù hợp với sản phẩm và quy định pháp luật.',
          bullets: [
            'Thay đổi quan trọng sẽ được thông báo qua email hoặc trong ứng dụng.',
            'Việc tiếp tục sử dụng sau khi điều khoản có hiệu lực đồng nghĩa với chấp thuận.',
          ],
        },
      ],
      cta: {
        title: 'Đồng ý với điều khoản',
        description: 'Tạo tài khoản hoặc tiếp tục sử dụng NexHire để đồng ý với các điều khoản trên.',
        primaryLabel: 'Tạo tài khoản',
        primaryHref: '/register',
        secondaryLabel: 'Đọc chính sách bảo mật',
        secondaryHref: '/privacy',
      },
    },
  },
}
