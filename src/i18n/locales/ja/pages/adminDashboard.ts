import type { AdminDashboardTranslations } from '../../../types'

export const adminDashboard: AdminDashboardTranslations = {
  routeLabel: '管理概要',
  pageTitle: '管理概要',
  subtitle: 'プラットフォーム全体のユーザー、企業、審査状況を確認します。',
  loadingLabel: '概要データを読み込んでいます',
  header: {
    lastUpdated: '更新時刻',
    refresh: '更新',
    refreshing: '更新中',
  },
  growth: {
    title: 'ユーザー増加',
    description: 'ユーザー総数と新規アカウントの推移を確認します。',
    demoBadge: 'ライブデータ',
    comparisonLabel: '前期比',
    unavailableLabel: 'まだ比較できません',
    totalUsers: 'ユーザー総数',
    newUsers: '新規ユーザー',
    periods: {
      '7d': '7日',
      '30d': '30日',
      '90d': '90日',
    },
  },
  error: {
    title: '概要を読み込めません',
    description: '管理データを現在取得できません。もう一度お試しください。',
    retry: '再試行',
  },
  empty: {
    title: 'システムデータがありません',
    description: 'ユーザー、企業、求人が登録されると指標が表示されます。',
  },
  stats: {
    users: 'ユーザー総数',
    pendingCompanies: '審査待ち企業',
    pendingJobs: '審査待ち求人',
    pendingRevisions: '審査待ち修正',
  },
  charts: {
    usersByRole: '役割別ユーザー',
    companiesByStatus: '状態別企業',
    jobsByStatus: '状態別求人',
    noData: 'データがありません',
  },
  roles: {
    CANDIDATE: '候補者',
    RECRUITER: '採用担当者',
    ADMIN: '管理者',
  },
  companyStatuses: {
    PENDING: '審査待ち',
    APPROVED: '承認済み',
    REJECTED: '却下',
    SUSPENDED: '停止中',
  },
  jobStatuses: {
    DRAFT: '下書き',
    PENDING_REVIEW: '審査待ち',
    NEEDS_REVIEW: '要確認',
    SHOULD_REJECT: '却下候補',
    PUBLISHED: '公開中',
    UNPUBLISHED: '非公開',
    CLOSED: '終了',
    REJECTED: '却下',
    ARCHIVED: 'アーカイブ',
  },
  queues: {
    title: '対応が必要なキュー',
    description: '管理者の確認が必要な項目へ直接移動します。',
    companies: '確認待ち企業',
    jobs: '審査待ち求人',
    revisions: '審査待ち修正',
    action: '一覧を見る',
  },
}
