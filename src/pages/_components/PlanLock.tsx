import { useId } from 'react'
import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import './plan-lock.css'

/**
 * Result of the permission check (`can()` / `usePermission`).
 * PlanLock never checks permissions itself: it only renders from this result.
 */
export type PlanLockAccess = {
  allowed: boolean
  reason?: 'plan' | 'role' | null
}

type PlanLockProps = {
  access: PlanLockAccess
  children?: ReactNode
  className?: string
  description?: string
  headingLevel?: 'h2' | 'h3'
  title?: string
  upgradeHref?: string
}

export const PLAN_UPGRADE_HREF = '/recruiter/company?tab=billing'

/**
 * Allowed: renders children.
 * Blocked by plan: renders a locked card with an "Upgrade to Pro" action.
 * Blocked by role: renders nothing.
 */
export function PlanLock({
  access,
  children,
  className = '',
  description,
  headingLevel = 'h2',
  title,
  upgradeHref = PLAN_UPGRADE_HREF,
}: PlanLockProps) {
  const { common } = useTranslations()
  const titleId = useId()

  if (access.allowed) return <>{children}</>
  if (access.reason !== 'plan') return null

  const Heading = headingLevel

  return (
    <section aria-labelledby={titleId} className={`plan-lock ${className}`.trim()} data-state="locked">
      <span aria-hidden="true" className="plan-lock__icon">
        <Lock focusable="false" />
      </span>
      <div className="plan-lock__copy">
        <span className="plan-lock__badge">{common.planLock.badge}</span>
        <Heading id={titleId}>{title ?? common.planLock.title}</Heading>
        <p>{description ?? common.planLock.description}</p>
      </div>
      <Link className="plan-lock__action" to={upgradeHref}>
        {common.planLock.upgrade}
      </Link>
    </section>
  )
}
