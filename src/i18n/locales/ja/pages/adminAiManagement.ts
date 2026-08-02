import type { AdminAiManagementTranslations } from '../../../types'

export const adminAiManagement: AdminAiManagementTranslations = {
  routeLabel: '管理者 — AI管理', pageTitle: 'AI管理', sidebarLabel: 'AI管理',
  pageSubtitle: 'モデルを管理し、プラットフォーム全体のCV解析アクティビティを監視します。',
  header: { title: 'AIオペレーションセンター', refresh: 'データを更新', refreshing: '更新中…', healthy: '稼働中', degraded: '一部障害', unknown: '不明' },
  tabs: { overview: '概要', config: '設定', logs: '利用ログ' },
  notes: { newRequests: 'プロバイダー／モデルの変更は新しいCV解析リクエストのみに適用されます。', apiKeys: 'APIキーはバックエンド環境で設定され、ここには表示されません。', estimatedCost: '費用は設定された価格に基づく推定値で、実際の請求額と異なる場合があります。' },
  config: { title: '実行設定', description: 'CV解析に使用するプロバイダーとモデルを選択します。', provider: '有効なプロバイダー', gemini: 'Gemini', openAi: 'OpenAI互換', geminiModel: 'Geminiモデル', openAiModel: 'OpenAI互換モデル', save: '変更を保存', saving: '保存中…', updatedAt: '更新日時', updatedBy: '更新者', neverUpdated: '管理者による更新履歴はありません。', loadErrorTitle: 'AI設定を読み込めません', loadErrorDescription: '不完全な更新を防ぐためフォームを無効化しました。', retry: '再試行', success: 'AI設定を更新しました。', error: 'AI設定を更新できませんでした。', undo: '元に戻す', activeProvider: '選択中のプロバイダー', selectedModel: '使用するモデル' },
  summary: { title: '利用概要', description: '直近30日間のプロバイダー／モデル別集計です。', totalRequests: '総リクエスト', succeededRequests: '成功', failedRequests: '失敗', totalTokens: '総トークン', estimatedCost: '推定費用', noPricing: '価格未設定', empty: '直近30日間のAI利用データはありません。', errorTitle: 'AI利用概要を読み込めません', errorDescription: '実行設定は引き続き利用できます。', retry: '再試行', successRate: '成功率', providerBreakdown: 'プロバイダー／モデル別詳細', columns: { provider: 'プロバイダー', model: 'モデル', requests: 'リクエスト', success: '成功', failed: '失敗', failureRate: '失敗率', inputTokens: '入力トークン', outputTokens: '出力トークン', totalTokens: '総トークン', cost: '費用' } },
  logs: { title: '利用ログ', description: '監査と障害調査のためAIリクエストを確認します。', count: '{{count}}件', provider: 'プロバイダー', model: 'モデル', status: '状態', dateFrom: '開始日', dateTo: '終了日', candidateCvId: 'Candidate CV ID', allProviders: 'すべて', allModels: 'すべてのモデル', allStatuses: 'すべての状態', apply: '適用', clear: 'クリア', loading: 'ログを読み込み中…', errorTitle: '利用ログを読み込めません', errorDescription: 'フィルターを変更するか、後でもう一度お試しください。', retry: '再試行', emptyTitle: '該当するログがありません', emptyDescription: 'フィルターを変更または解除してください。', copied: 'IDをコピーしました。', copy: 'コピー', noValue: '—', succeeded: '成功', failed: '失敗', noPricing: '価格なし', columns: { request: 'Request / CV', providerModel: 'プロバイダー / モデル', status: '状態', tokens: 'トークン', latency: '遅延', cost: '費用', createdAt: '作成日時', error: 'エラー' } },
  pagination: { prev: '前のページ', next: '次のページ', pageOf: '{{current}} / {{total}}ページ' },
}
