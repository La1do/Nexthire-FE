import type { SearchTranslations } from '../../../types'

export const search: SearchTranslations = {
  routeLabel: '求人検索',
  toolbar: {
    title: '条件に合う求人を探す',
    description: 'キーワード、勤務地、フィルターを調整して関連度の高い求人を確認できます。',
    keywordLabel: 'キーワード',
    keywordPlaceholder: '職種、スキル、企業名',
    locationLabel: '勤務地',
    locationPlaceholder: 'すべての勤務地',
    submit: '検索を更新',
  },
  filters: {
    title: 'フィルター',
    description: '条件を絞りすぎず、結果を素早く確認できる状態にします。',
    fieldLabel: '職種カテゴリ',
    locationLabel: '勤務地',
    salaryLabel: '最低給与',
    workModeLabel: '働き方',
    allOption: 'すべて',
    clear: 'フィルターをクリア',
    apply: '適用',
    fieldOptions: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Design', value: 'Design' },
      { label: 'Business', value: 'Business' },
    ],
    salaryOptions: [
      { label: '15M以上', value: '15' },
      { label: '20M以上', value: '20' },
      { label: '25M以上', value: '25' },
      { label: '35M以上', value: '35' },
    ],
    workModeOptions: [
      { label: 'リモート', value: 'リモート' },
      { label: 'ハイブリッド', value: 'ハイブリッド' },
      { label: '出社', value: '出社' },
    ],
  },
  results: {
    title: '一致した求人',
    countLabel: '{{count}}件の求人',
    emptyQuery: 'すべての募集中求人',
    sortLabel: '並び替え',
    sortOptions: [
      { label: '関連度順', value: 'relevance' },
      { label: '新着順', value: 'newest' },
      { label: '給与が高い順', value: 'salary' },
    ],
    saveLabel: '求人を保存',
    verifiedLabel: '認証済み',
    detailLabel: '詳細を見る',
    activeFiltersLabel: '適用中のフィルター',
  },
  empty: {
    title: '一致する求人がありません',
    description: 'キーワードを短くするか、フィルターを減らして結果を広げてください。',
    action: 'すべての求人を見る',
  },
}
