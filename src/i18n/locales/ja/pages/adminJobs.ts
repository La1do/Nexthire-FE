import type { AdminJobsTranslations } from '../../../types'

export const adminJobs: AdminJobsTranslations = {
  routeLabel: '管理者 - 求人', pageTitle: '求人審査', pageSubtitle: '求人内容、リスク、審査キューを管理します。',
  tabs: { all: 'すべての求人', review: '求人審査', revisions: '修正審査' },
  stats: { total: '求人総数', review: '審査待ち', published: '公開中', revisions: '修正審査待ち' },
  filters: { searchLabel: '検索', searchPlaceholder: '求人名、企業、勤務地、スキル', statusLabel: 'ステータス', statusAll: 'すべてのステータス', riskLabel: 'リスク', riskAll: 'すべてのリスク', companyLabel: '企業', companyAll: 'すべての企業', sortLabel: '並び替え', clear: 'フィルター解除' },
  columns: { job: '求人', company: '企業', status: 'ステータス', risk: 'リスク', applications: '応募数', updated: '更新日', actions: '操作' },
  statuses: { DRAFT: '下書き', PENDING_REVIEW: '審査待ち', NEEDS_REVIEW: '要確認', SHOULD_REJECT: '却下推奨', PUBLISHED: '公開中', UNPUBLISHED: '非公開', REJECTED: '却下', CLOSED: '終了', EXPIRED: '期限切れ', APPROVED: '承認済み', CANCELLED: 'キャンセル' },
  risks: { LOW: '低', MEDIUM: '中', HIGH: '高', CRITICAL: '重大', NONE: '未評価' },
  sorts: { latest: '新しい順', oldest: '古い順', risk: 'リスク順', applications: '応募数順' },
  detail: { title: '審査詳細', description: '仕事内容', requirements: '応募要件', benefits: '福利厚生', skills: 'スキル', moderation: '審査分析', reasons: '警告理由', rules: '該当ルール', changeSummary: '変更概要', noData: 'データなし', close: '閉じる' },
  actions: { view: '詳細を見る', approve: '承認', reject: '却下', unpublish: '非公開', republish: '再公開', close: '求人終了', cancel: 'キャンセル', confirmTitle: '操作の確認', confirmDescription: '「{{title}}」を{{action}}しますか？', reasonTitle: '理由を入力', reasonDescription: '「{{title}}」を{{action}}する理由を入力してください。', reasonLabel: '理由', reasonPlaceholder: '採用担当者と監査履歴のため、明確な理由を入力してください...', reasonRequired: '理由は必須です。' },
  feedback: { loading: '求人データを読み込み中', errorTitle: '求人を読み込めません', errorDescription: '管理者用求人データを取得できませんでした。', retry: '再試行', emptyTitle: '該当する求人はありません', emptyDescription: 'キーワードまたはフィルターを変更してください。', countLabel: '{{count}}件の求人', actionSuccess: '求人を更新しました。', actionError: '操作を完了できませんでした。' },
  pagination: { prev: '前のページ', next: '次のページ', pageOf: '{{current}} / {{total}} ページ' },
}
