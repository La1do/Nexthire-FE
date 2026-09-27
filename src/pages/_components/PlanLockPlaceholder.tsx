import { Link } from 'react-router-dom'
import { RECRUITER_UPGRADE_PATH } from '../../constants/recruiterPaths'
import { useTranslations } from '../../i18n'
import type { PermissionResult } from '../../lib/auth/permissions'
import './plan-lock-placeholder.css'

type PlanLockPlaceholderProps = {
  /** The can() result that caused the lock (reason 'plan'). Kept so a richer PlanLock can use it later. */
  result: PermissionResult
}

/**
 * Minimal, swappable "locked by plan" state (reason 'plan' only; role denials never render this).
 * Owned by A1 as a placeholder: the final PlanLock design can replace this component without touching guards.
 */
export function PlanLockPlaceholder({ result }: PlanLockPlaceholderProps) {
  const { common } = useTranslations()
  const text = common.companyAccess

  return (
    <section className="plan-lock-placeholder" data-reason={result.reason}>
      <div className="plan-lock-placeholder__card">
        <span aria-hidden="true" className="plan-lock-placeholder__badge">
          {text.lockedBadge}
        </span>
        <h2 className="plan-lock-placeholder__title">{text.lockedTitle}</h2>
        <p className="plan-lock-placeholder__description">{text.lockedDescription}</p>
        <Link className="plan-lock-placeholder__action" to={RECRUITER_UPGRADE_PATH}>
          {text.upgradeAction}
        </Link>
      </div>
    </section>
  )
}
