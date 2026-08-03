import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type AdminUserActionMenuItem = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick: () => void
  tone?: 'default' | 'danger' | 'success' | 'warning'
}

type Props = {
  items: AdminUserActionMenuItem[]
  label: string
}

export function AdminUserActionMenu({ items, label }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return <div className="admin-user-action-menu" ref={menuRef}>
    <button aria-controls={menuId} aria-expanded={isOpen} aria-haspopup="menu" aria-label={label} className="admin-user-action-menu__trigger" onClick={() => setIsOpen((current) => !current)} title={label} type="button"><span className="sr-only">{label}</span></button>
    {isOpen ? <div className="admin-user-action-menu__popover" id={menuId} role="menu">{items.map((item) => <button className={`admin-user-action-menu__item admin-user-action-menu__item--${item.tone ?? 'default'}`} disabled={item.disabled} key={item.label} onClick={() => { setIsOpen(false); item.onClick() }} role="menuitem" type="button">{item.icon}<span>{item.label}</span></button>)}</div> : null}
  </div>
}
