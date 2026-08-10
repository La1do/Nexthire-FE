type Props = { actionLabel: string; description: string; onRetry: () => void; title: string }

export function AdminAiInlineError({ actionLabel, description, onRetry, title }: Props) {
  return <div className="admin-ai-inline-error" role="alert"><span aria-hidden="true">!</span><div><strong>{title}</strong><p>{description}</p></div><button onClick={onRetry} type="button">{actionLabel}</button></div>
}
