import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { DismissIcon, SearchIcon } from '../../assets/icons/admin'
import type { AdminUsersTranslations } from '../../i18n/types'

type Props = { content: AdminUsersTranslations['topbar'] }
const searchable = ['/admin/users', '/admin/companies', '/admin/jobs']

export function AdminTopbarSearch({ content }: Props) {
  const { pathname } = useLocation(); const navigate = useNavigate(); const [params, setParams] = useSearchParams()
  const [value, setValue] = useState(params.get('search') ?? ''); const [focused, setFocused] = useState(false); const inputRef = useRef<HTMLInputElement>(null)
  const canSearch = searchable.includes(pathname)
  useEffect(() => setValue(params.get('search') ?? ''), [params])
  const apply = () => { if (!canSearch) return; const next = new URLSearchParams(params); if (value.trim()) next.set('search', value.trim()); else next.delete('search'); setParams(next) }
  const clear = () => { setValue(''); if (canSearch) { const next = new URLSearchParams(params); next.delete('search'); setParams(next) } inputRef.current?.focus() }
  const quickLinks = [['/admin/dashboard', content.quickDashboard], ['/admin/users', content.quickUsers], ['/admin/companies', content.quickCompanies], ['/admin/jobs', content.quickJobs], ['/admin/ai-management', content.quickAi], ['/admin/settings', content.quickSettings]]
  const availableLinks = quickLinks.filter(([to]) => pathname !== to)
  return <div className="admin-topbar-search-wrap"><form className="admin-topbar__search" onSubmit={(event) => { event.preventDefault(); apply() }} role="search"><SearchIcon /><input aria-label={content.searchPlaceholder} onBlur={() => window.setTimeout(() => setFocused(false), 120)} onChange={(event) => setValue(event.target.value)} onFocus={() => setFocused(true)} placeholder={content.searchPlaceholder} ref={inputRef} type="text" value={value} />{value ? <button aria-label={content.searchPlaceholder} className="admin-topbar__search-clear" onClick={clear} type="button"><DismissIcon /></button> : null}</form>{focused ? <div className="admin-topbar-search-menu"><strong>{content.quickLinks}</strong>{availableLinks.map(([to,label]) => <button key={to} onMouseDown={(event) => { event.preventDefault(); navigate(to); setFocused(false) }} type="button">{label}</button>)}</div> : null}</div>
}
