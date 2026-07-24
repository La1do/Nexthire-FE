import type { JobDetailTranslations } from '../../../types'

export const jobDetail: JobDetailTranslations = {
  routeLabel: '求人詳細',
  backToSearch: '検索結果に戻る',
  states: {
    loading: '求人を読み込み中...',
    errorTitle: '求人を読み込めませんでした',
    errorDescription: '求人の読み込み中にエラーが発生しました。もう一度お試しください。',
  },
  hero: {
    metaLabel: '求人の主要情報',
    verifiedLabel: '認証済み企業',
  },
  sidebar: {
    title: '募集概要',
    salary: '給与',
    location: '勤務地',
    workMode: '働き方',
    postedAt: '掲載',
    deadline: '応募締切',
    noDeadline: '期限なし',
    openings: '募集人数',
    apply: '応募する',
    save: '求人を保存',
    saved: '保存済み',
    saveError: '求人を保存できませんでした。もう一度お試しください。',
    jobNotPublic: 'この求人は現在公開されていないため、保存できません。',
    loginHint: 'ログインして求人を保存し、自分のリストから確認できます。',
  },
  sections: {
    description: '仕事内容',
    requirements: '応募要件',
    benefits: '待遇・福利厚生',
  },
  related: {
    title: '関連求人',
    viewAll: '検索でもっと見る',
    viewDetail: '詳細を見る',
  },
  notFound: {
    title: '求人が見つかりません',
    description: 'この求人は終了したか、リンクが正しくない可能性があります。',
    action: '求人検索に戻る',
  },
}
