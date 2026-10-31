export const matchingCopy = {
  en: {
    denied: 'Access to this application is unavailable. Check your session and permissions.',
    waitingCv: 'Waiting for CV parsing before evidence retrieval. Automatic checks are limited to 90 seconds.',
    parseReady: 'CV parsing is ready. The queued request has no tracking ID; refresh evidence or retry later. Its completion has not been confirmed.',
    succeeded: 'New evidence retrieval result is ready for HR review. No overall fit score is available.',
    failed: 'The matching job failed. Retry evidence retrieval.',
    parseFailed: 'CV parsing failed. Retry after checking the CV.',
    network: 'Unable to check matching status. Automatic checks stopped. Refresh or retry later.',
    invalid: 'The matching response does not identify this application or request safely. Refresh or retry.',
  },
  vi: {
    denied: 'Không có quyền truy cập hồ sơ này. Kiểm tra phiên đăng nhập và quyền của bạn.',
    waitingCv: 'Đang chờ phân tích CV trước khi truy hồi bằng chứng. Kiểm tra tự động tối đa 90 giây.',
    parseReady: 'CV đã phân tích xong. Yêu cầu đang xếp hàng chưa có mã theo dõi; tải lại bằng chứng hoặc thử lại sau. Chưa xác nhận yêu cầu đã hoàn tất.',
    succeeded: 'Đã có kết quả truy hồi mới để HR kiểm tra. Hiện chưa có điểm phù hợp tổng hợp.',
    failed: 'Tác vụ đối chiếu thất bại. Vui lòng thử lại truy hồi bằng chứng.',
    parseFailed: 'Phân tích CV thất bại. Kiểm tra CV rồi thử lại.',
    network: 'Không thể kiểm tra trạng thái đối chiếu. Đã dừng kiểm tra tự động. Tải lại hoặc thử lại sau.',
    invalid: 'Phản hồi đối chiếu không xác định an toàn hồ sơ hoặc yêu cầu này. Tải lại hoặc thử lại.',
  },
  ja: {
    denied: 'この応募にアクセスできません。ログイン状態と権限を確認してください。',
    waitingCv: '根拠検索の前にCVの解析を待っています。自動確認は最大90秒です。',
    parseReady: 'CVの解析が完了しました。待機中のリクエストには追跡IDがありません。根拠を更新するか、後で再試行してください。処理完了は未確認です。',
    succeeded: '新しい検索結果をHRが確認できます。総合適合スコアは利用できません。',
    failed: '照合処理に失敗しました。根拠検索を再試行してください。',
    parseFailed: 'CVの解析に失敗しました。CVを確認して再試行してください。',
    network: '照合状況を確認できません。自動確認を終了しました。更新または再試行してください。',
    invalid: '応募またはリクエストを安全に特定できない応答です。更新または再試行してください。',
  },
} as const

export type MatchingMessage = keyof typeof matchingCopy.en | 'started' | 'timeout' | 'processingAction'
