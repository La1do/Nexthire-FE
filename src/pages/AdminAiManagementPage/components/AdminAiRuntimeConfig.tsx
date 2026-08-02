import { useEffect, useState } from 'react'
import type { AdminAiManagementTranslations } from '../../../i18n/types'
import type { AdminAiConfig, AdminAiProvider, UpdateAdminAiConfigPayload } from '../../../types/admin.types'

type Props = {
  config: AdminAiConfig
  content: AdminAiManagementTranslations
  isPending: boolean
  onSave: (payload: UpdateAdminAiConfigPayload) => void
}

export function AdminAiRuntimeConfig({ config, content, isPending, onSave }: Props) {
  const [provider, setProvider] = useState<AdminAiProvider>(config.currentConfig.activeProvider)
  const [geminiModel, setGeminiModel] = useState(config.currentConfig.geminiModel)
  const [openAiModel, setOpenAiModel] = useState(config.currentConfig.openAiModel)

  useEffect(() => {
    setProvider(config.currentConfig.activeProvider)
    setGeminiModel(config.currentConfig.geminiModel)
    setOpenAiModel(config.currentConfig.openAiModel)
  }, [config])

  const isDirty = provider !== config.currentConfig.activeProvider || geminiModel !== config.currentConfig.geminiModel || openAiModel !== config.currentConfig.openAiModel
  const updatedAt = config.currentConfig.updatedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(config.currentConfig.updatedAt)) : null
  const activeModels = config.supportedModels[provider]
  const activeModel = provider === 'GEMINI' ? geminiModel : openAiModel
  const reset = () => {
    setProvider(config.currentConfig.activeProvider)
    setGeminiModel(config.currentConfig.geminiModel)
    setOpenAiModel(config.currentConfig.openAiModel)
  }
  const selectModel = (value: string) => provider === 'GEMINI' ? setGeminiModel(value) : setOpenAiModel(value)

  return <section className="admin-ai-panel admin-ai-config">
    <header className="admin-ai-panel__header"><div><h2>{content.config.title}</h2><p>{content.config.description}</p></div><span className={`admin-ai-provider-pill admin-ai-provider-pill--${provider.toLowerCase()}`}>{provider}</span></header>
    <div className="admin-ai-config__workspace">
      <div><span className="admin-ai-field-label">{content.config.activeProvider}</span><div className="admin-ai-provider-control" role="group" aria-label={content.config.provider}>{(['GEMINI', 'OPENAI'] as const).map((item) => <button aria-pressed={provider === item} className={provider === item ? 'is-active' : ''} key={item} onClick={() => setProvider(item)} type="button">{item === 'GEMINI' ? content.config.gemini : content.config.openAi}</button>)}</div></div>
      <label><span>{content.config.selectedModel}</span><select onChange={(event) => selectModel(event.target.value)} value={activeModel}>{activeModels.map((model) => <option key={model.id} value={model.id}>{model.name}{model.isDefault ? ' · Default' : ''}</option>)}</select></label>
    </div>
    <div className="admin-ai-config__meta">{updatedAt ? <><span>{content.config.updatedAt}: <strong>{updatedAt}</strong></span><span>{content.config.updatedBy}: <strong>{config.currentConfig.updatedByUserId ?? '—'}</strong></span></> : <span>{content.config.neverUpdated}</span>}</div>
    <div className="admin-ai-note-list"><p>{content.notes.newRequests}</p><p>{content.notes.apiKeys}</p></div>
    <footer><button className="admin-ai-secondary-button" disabled={!isDirty || isPending} onClick={reset} type="button">{content.config.undo}</button><button className="admin-ai-primary-button" disabled={!isDirty || isPending} onClick={() => onSave({ activeProvider: provider, geminiModel, openAiModel })} type="button">{isPending ? content.config.saving : content.config.save}</button></footer>
  </section>
}
