import type { JobDetailTranslations } from '../../../types'

export const jobDetail: JobDetailTranslations = {
  routeLabel: '求人詳細',
  backToSearch: '検索結果に戻る',
  hero: {
    metaLabel: '求人の主要情報',
    verifiedLabel: '認証済み企業',
  },
  sidebar: {
    title: '募集概要',
    salary: '給与',
    location: '勤務地',
    workMode: '働き方',
    field: '職種カテゴリ',
    postedAt: '掲載',
    apply: '応募する',
    save: '求人を保存',
  },
  sections: {
    overview: {
      title: '役割の概要',
      body: '{{company}} は {{field}} 領域で {{title}} を募集しています。{{location}} で {{workMode}} の働き方を希望し、実用的な改善を素早く届けたい方に合う求人です。',
    },
    responsibilities: {
      title: '担当すること',
      items: [
        '{{tags}} に関わる主要な取り組みを構築し改善します。',
        'プロダクトチームと協力し、採用ニーズを分かりやすいユーザー体験に落とし込みます。',
        'リリースごとに品質とフィードバックを確認し、業務フローを改善します。',
      ],
    },
    requirements: {
      title: '求める経験',
      items: [
        '{{tags}} または {{field}} 領域で近いスキルを使った実務経験。',
        '{{workMode}} の働き方で明確にコミュニケーションできること。',
        '課題を分析し、現実的な提案を行い、チームのリズムに合わせてやり切れること。',
      ],
    },
    benefits: {
      title: '注目ポイント',
      items: [
        '想定給与 {{salary}} と透明性のある選考プロセス。',
        '{{location}} の {{workMode}} 環境で、現代的なプロダクト開発に慣れたチームと働けます。',
        'NexHire のプロフィール整理により、企業からの返信が早くなりやすいです。',
      ],
    },
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
