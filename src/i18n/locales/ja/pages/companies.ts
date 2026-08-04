import type { CompaniesTranslations } from '../../../types'

export const companies: CompaniesTranslations = {
  routeLabel: '企業',
  hero: {
    title: '採用中の企業を探す',
    description:
      '認証済み企業を確認し、募集中の求人や働き方を見比べてから応募できます。',
    searchLabel: '企業を検索',
    searchPlaceholder: '企業名、職種、スキル',
    locationLabel: '勤務地',
    locationAll: 'すべての勤務地',
    workModeLabel: '働き方',
    workModeAll: 'すべての働き方',
    reset: '絞り込みを解除',
  },
  stats: {
    companies: '採用中の企業',
    openRoles: '募集中の求人',
    remoteFriendly: 'リモート対応企業',
  },
  sort: {
    mostJobs: '求人が多い順',
    latest: '最近採用中',
    name: '名前 A-Z',
  },
  sections: {
    directoryTitle: '企業一覧',
    directoryDescription: '企業名、勤務地、働き方で素早く絞り込めます。',
    latestJobsTitle: '新着求人ハイライト',
    latestJobsDescription: 'この一覧の企業から新しい求人を一部表示しています。',
  },
  card: {
    verified: '認証済み',
    openRoles: '募集中',
    latestHiring: '最新の動き',
    locations: '勤務地',
    workModes: '働き方',
    rolesPreview: '新着求人',
    noLocation: '未更新',
    noJobs: '表示できる求人はまだありません',
  },
  actions: {
    viewCompany: '企業ページを見る',
    viewJobs: '求人を見る',
    retry: '再試行',
  },
  states: {
    loading: '企業一覧を読み込み中...',
    errorTitle: '企業一覧を読み込めませんでした',
    errorDescription: 'しばらくしてからもう一度お試しください。',
    emptyTitle: '該当する企業がありません',
    emptyDescription: 'キーワード、勤務地、働き方を変更してみてください。',
  },
}
