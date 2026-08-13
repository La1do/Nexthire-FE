import { useEffect, useRef, useState } from 'react'
import { CameraIcon } from '../../../assets/icons/admin'
import { useToast } from '../../../context'
import type { AdminSettingsTranslations } from '../../../i18n/types'
import type { AuthProfile } from '../../../services/auth.service'

type Props = { content: AdminSettingsTranslations['summary']; isPending: boolean; onDelete: () => Promise<unknown>; onUpload: (file: File) => Promise<unknown>; profile: AuthProfile }

function initials(value: string) {
  const parts = value.trim().split(/\s+/)
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts.at(-1)?.[0] ?? '' : ''}`.toUpperCase() || 'A'
}

export function AdminAccountSummary({ content, isPending, onDelete, onUpload, profile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null); const toast = useToast(); const [pendingFile, setPendingFile] = useState<File | null>(null); const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  useEffect(() => { if (!pendingFile) { setPreviewUrl(null); return }; const url = URL.createObjectURL(pendingFile); setPreviewUrl(url); return () => URL.revokeObjectURL(url) }, [pendingFile])
  const name = profile.fullName || content.fallbackName
  return <section className="admin-settings-summary">
    <div className="admin-settings-summary__identity">
      {previewUrl || profile.avatarUrl || profile.logoUrl ? <img alt="" src={previewUrl ?? profile.avatarUrl ?? profile.logoUrl ?? ''} /> : <span aria-hidden="true">{initials(name)}</span>}
      <div className="admin-settings-summary__identity-copy"><h2>{name}</h2><p>{profile.email}</p><strong>{content.adminRole}</strong></div>
    </div>
    <div className="admin-settings-avatar-actions"><input accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) { toast.error(content.invalidAvatar); return } setPendingFile(file); event.target.value = '' }} ref={inputRef} type="file" /><button disabled={isPending} onClick={() => inputRef.current?.click()} type="button"><CameraIcon />{content.changeAvatar}</button>{pendingFile ? <><button disabled={isPending} onClick={() => void onUpload(pendingFile).then(() => setPendingFile(null)).catch(() => toast.error(content.avatarError))} type="button">{content.saveAvatar}</button><button disabled={isPending} onClick={() => setPendingFile(null)} type="button">{content.cancelAvatar}</button></> : profile.avatarUrl ? <button disabled={isPending} onClick={() => void onDelete().catch(() => toast.error(content.avatarError))} type="button">{content.removeAvatar}</button> : null}<small>{content.avatarHint}</small></div>
    <dl>
      <div><dt>{content.accountId}</dt><dd title={profile.id}>{profile.id.slice(0, 8)}…</dd></div>
      <div className="admin-settings-summary__email-row"><dt>{content.email}</dt><dd>{profile.email}</dd></div>
      <div><dt>{content.role}</dt><dd>{content.adminRole}</dd></div>
    </dl>
  </section>
}
