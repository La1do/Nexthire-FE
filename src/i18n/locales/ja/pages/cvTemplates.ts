export const cvTemplates = {
  routeLabel: 'CVテンプレート',
  hero: {
    inventoryLabel: '利用可能なテンプレート1件 · ビルダーでPDF出力',
    title: '採用向けCVテンプレートから作成',
    description:
      'ビルダーに接続済みのテンプレートを選び、プロフィールに合わせて編集し、応募前にPDFで出力できます。',
    primaryAction: 'Professionalを使う',
    secondaryAction: 'テンプレートを見る',
  },
  stats: {
    readyTemplates: '{{count}}件の利用可能テンプレート',
    categoryGroups: '{{count}}件の職種グループ',
    exportReady: 'ビルダーでPDF出力',
  },
  filters: {
    label: '職種グループでCVテンプレートを絞り込む',
    countLabel: '{{count}}件',
    emptyTitle: '一致するテンプレートはまだありません',
    emptyDescription: '「すべて」を選ぶか、新しいテンプレートの公開をお待ちください。',
  },
  categories: {
    all: 'すべて',
    it: 'IT',
    marketing: 'マーケティング / PR',
    sales: '営業 / ビジネス',
    hr: '人事 / 管理',
  },
  card: {
    readyLabel: '利用可能',
    categoriesLabel: '適した分野',
    useTemplate: 'このテンプレートを使う',
    previewAlt: '{{name}} CVテンプレートのプレビュー',
  },
  notes: {
    title: '現在のフロー',
    items: [
      '設定タブを切り替えても、ビルダーに入力した内容は保持されます。',
      'Professionalは実際のレンダラーがあり、すぐに利用できます。',
      '新しいテンプレートは対応レンダラー実装後に有効化します。',
    ],
  },
  upcoming: {
    title: '準備中',
    description: '下のレイアウトは方向性の表示のみです。対応レンダラーが入るまで利用ボタンは無効です。',
    badge: '近日公開',
    items: [
      {
        name: 'Minimal ATS',
        description: '1カラム、控えめな色、ATSと素早い確認に向いた構成。',
        category: 'IT / Operations',
      },
      {
        name: 'Portfolio Focus',
        description: 'プロジェクトと成果を先に見せたい候補者向け。',
        category: 'Marketing / Product',
      },
      {
        name: 'Graduate Start',
        description: '学歴、活動、初期キャリアを整理しやすい軽い構成。',
        category: 'Entry level',
      },
    ],
  },
}
