import type { HomeTranslations } from '../../../types'

export const home: HomeTranslations = {
  states: {
    loading: '求人を読み込み中…',
    errorTitle: '読み込みに失敗しました',
    errorDescription: 'ページを再読み込みするか、しばらくしてからお試しください。',
    emptyTitle: 'データがありません',
    emptyDescription: '該当する結果がまだありません。',
  },
  hero: {
    eyebrow: 'キャリア機会',
    title: '次の一歩に合う仕事を見つける',
    description: '信頼できる企業の求人を、勤務地・給与・働き方で素早く絞り込めます。',
    keywordLabel: '求人キーワード',
    keywordPlaceholder: '職種、スキル、企業名',
    locationLabel: '勤務地',
    locationPlaceholder: 'すべての勤務地',
    locationOptions: ['ハノイ', 'ホーチミン', 'ダナン', 'リモート'],
    filterLabel: 'フィルターを開く',
    submit: '検索',
    quickFilters: ['リモート', 'ハイブリッド', 'Senior', '25M+給与'],
    stats: {
      openRoles: '募集中の求人',
      companies: '認証済み企業',
      categories: '職種カテゴリ',
    },
    spotlight: {
      title: '今週の積極採用',
      subtitle: '候補者ニーズが高いポジションを持つ企業',
    },
  },
  employers: {
    eyebrow: '採用パートナー',
    title: '採用を強化している企業',
    viewAll: 'すべて見る',
  },
  jobs: {
    eyebrow: '求人一覧',
    title: '今日おすすめの求人',
    tabs: ['おすすめ', '新着', '高給与'],
    loadMore: '求人をもっと見る',
    saveLabel: '求人を保存',
  },
  categories: {
    eyebrow: 'クイック検索',
    title: '職種カテゴリで絞り込む',
  },
  industryJobs: {
    eyebrow: '業界別',
    title: '業界ごとの求人',
    viewAll: 'すべての業界を見る',
    viewMore: 'もっと見る',
    saveLabel: '求人を保存',
  },
  articles: {
    title: 'キャリアガイド',
    readMore: '続きを読む',
    items: [
      {
        category: 'Interview',
        description: '回答、逆質問、面接後のフォローアップを準備するためのチェックリスト。',
        title: '次の面接で印象を残す方法',
        tone: 'coral',
      },
      {
        category: 'CV',
        description: '実績、スキル、プロジェクトを読みやすく整理する方法。',
        title: '30分で強いCVを作る',
        tone: 'blue',
      },
      {
        category: 'Growth',
        description: '転職タイミング、給与交渉、次の学習計画を考えるためのガイド。',
        title: '持続的なキャリア成長戦略',
        tone: 'green',
      },
    ],
  },
  newsletter: {
    eyebrow: '新着求人アラート',
    title: '目標に合わせた求人アラートを設定',
    description: '新着求人、給与情報、キャリアに役立つ内容を毎週メールで受け取れます。',
    emailLabel: '通知用メール',
    emailPlaceholder: 'メールアドレス',
    submit: '登録',
    chips: ['Engineering', 'Remote', '25M+', 'Senior'],
    mockTitle: 'マッチした求人',
    mockLines: ['認証済み企業から4件の新着求人', '希望給与帯のリモート求人2件', '今週の面接チェックリスト'],
  },
}
