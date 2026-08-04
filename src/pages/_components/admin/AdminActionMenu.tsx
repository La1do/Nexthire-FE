import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type ActionMenuItem = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
  to?: string
  tone?: 'default' | 'danger' | 'success' | 'warning'
}

type Props = {
  items: ActionMenuItem[]
  label: string
}

export function AdminActionMenu({ items, label }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0, openUpward: false })
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!menuRef.current?.contains(target) && !popoverRef.current?.contains(target)) setIsOpen(false)
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

  useLayoutEffect(() => {
    if (!isOpen) return
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const openUpward = rect.bottom + 132 > window.innerHeight
      setPosition({
        left: Math.max(8, Math.min(rect.right - 172, window.innerWidth - 180)),
        top: openUpward ? Math.max(8, rect.top - 132) : rect.bottom + 6,
        openUpward,
      })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

  return <div className="admin-action-menu" ref={menuRef}>
    <button aria-controls={menuId} aria-expanded={isOpen} aria-haspopup="menu" aria-label={label} className="admin-action-menu__trigger" onClick={() => setIsOpen((current) => !current)} ref={triggerRef} title={label} type="button"><span className="sr-only">{label}</span></button>
    {isOpen ? createPortal(<div className="admin-action-menu__popover" id={menuId} ref={popoverRef} role="menu" style={{ left: position.left, top: position.top }}>
      {items.map((item) => item.to ? <Link className={`admin-action-menu__item admin-action-menu__item--${item.tone ?? 'default'}`} key={item.label} onClick={() => setIsOpen(false)} role="menuitem" to={item.to}>{item.icon}<span>{item.label}</span></Link> : <button className={`admin-action-menu__item admin-action-menu__item--${item.tone ?? 'default'}`} disabled={item.disabled} key={item.label} onClick={() => { setIsOpen(false); item.onClick?.() }} role="menuitem" type="button">{item.icon}<span>{item.label}</span></button>)}
    </div>, document.body) : null}
  </div>
}
