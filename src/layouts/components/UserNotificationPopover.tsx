import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import type { UserNotificationTranslations } from '../../i18n/types'
import type { NotificationItem } from '../../types/notification.types'

type Props = {
  buttonClassName?: string
  content: UserNotificationTranslations
  fallbackHref: string
}

function BellIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

function getDataString(item: NotificationItem, key: string) {
  const value = (item.data as Record<string, unknown>)[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function routeFor(item: NotificationItem, fallbackHref: string) {
  const isRecruiter = fallbackHref.startsWith('/recruiter')

  if (item.type === 'COMPANY_FOLLOWED_JOB_PUBLISHED') {
    const jobId = getDataString(item, 'jobId')
    return jobId ? `/jobs/${encodeURIComponent(jobId)}` : fallbackHref
  }

  if (item.type === 'APPLICATION_SUBMITTED') {
    return isRecruiter ? '/recruiter/applications' : '/profile/applications'
  }

  if (item.type === 'APPLICATION_STAGE_CHANGED') {
    return '/profile/applications'
  }

  if (item.type === 'COMPANY_VERIFICATION_CHANGED') {
    return isRecruiter ? '/recruiter/verification' : fallbackHref
  }

  return fallbackHref
}

export function UserNotificationPopover({ buttonClassName, content, fallbackHref }: Props) {
  const navigate = useNavigate()
  const [isOpen, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const { list, markAll, markRead, unread } = useNotifications({ listEnabled: isOpen })
  const unreadCount = unread.data ?? 0
  const buttonClasses = ['user-notification-button', buttonClassName].filter(Boolean).join(' ')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node | null
      if (target && wrapperRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [isOpen])

  return (
    <div className="user-notification-popover-wrap" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-label={content.label}
        className={buttonClasses}
        onClick={() => setOpen((value) => !value)}
        title={content.label}
        type="button"
      >
        <BellIcon />
        {unreadCount > 0 ? <span className="user-notification-badge">{Math.min(unreadCount, 99)}</span> : null}
      </button>

      {isOpen ? (
        <section aria-label={content.title} className="user-notification-popover">
          <header>
            <h2>{content.title}</h2>
            <button disabled={!unreadCount || markAll.isPending} onClick={() => markAll.mutate()} type="button">
              {content.markAllRead}
            </button>
          </header>

          {list.isPending ? (
            <div className="user-notification-state">{content.loading}</div>
          ) : list.isError ? (
            <div className="user-notification-state">{content.error}</div>
          ) : !list.data?.data.length ? (
            <div className="user-notification-state">{content.empty}</div>
          ) : (
            <ul>
              {list.data.data.map((item) => (
                <li className={item.readAt ? '' : 'is-unread'} key={item.id}>
                  <button
                    onClick={() => {
                      if (!item.readAt) {
                        markRead.mutate(item.id)
                      }
                      navigate(routeFor(item, fallbackHref))
                      setOpen(false)
                    }}
                    type="button"
                  >
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                    <time dateTime={item.createdAt}>
                      {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  )
}
