import { useAuth } from '../../../context/useAuth'
import { useCompanyPlan } from '../../../hooks/useCompanyPlan'
import { useLocale, useTranslations } from '../../../i18n'
import { ErrorState, Loading, PlanLock, SelectField } from '../../_components'
import type { PlanLockAccess } from '../../_components'
import { ASSIGNABLE_ROLES, countActiveSeats, isOwnerMember } from '../memberRoles'
import type { AssignableRole } from '../memberRoles'
import { useCompanyMembers } from '../useCompanyWorkspaceQueries'
import { fillTemplate, formatCompanyDate } from '../utils'
import { CompanyMemberAddForm } from './CompanyMemberAddForm'
import './company-members.css'

type CompanyMembersTabProps = {
  /** Result of `usePermission('members.manage')`. */
  access: PlanLockAccess
}

/**
 * Allowed: member list, seat usage and the add form.
 * Blocked by plan (FREE): lock card plus a read-only list, so suspended accounts stay visible.
 * TODO(A1): add / change role / remove have no service yet, so those controls stay disabled.
 */
export function CompanyMembersTab({ access }: CompanyMembersTabProps) {
  const { user } = useAuth()
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterCompany.members
  const canManage = access.allowed
  const isPlanLocked = !access.allowed && access.reason === 'plan'
  const membersQuery = useCompanyMembers(canManage || isPlanLocked)
  const seatLimit = useCompanyPlan().data?.seatLimit
  const members = membersQuery.data ?? []
  const quotaLabels: Record<AssignableRole, string> = { MANAGER: content.quotaManager, STAFF: content.quotaStaff }
  const hasSuspended = members.some((member) => member.status === 'SUSPENDED')

  if (!canManage && !isPlanLocked) return null

  function renderList() {
    if (membersQuery.isLoading) return <Loading label={content.loading} />

    if (membersQuery.isError) {
      return (
        <ErrorState
          actionLabel={pages.recruiterCompany.states.retry}
          description={pages.recruiterCompany.states.errorDescription}
          onRetry={() => void membersQuery.refetch()}
          title={content.errorTitle}
        />
      )
    }

    if (members.length === 0) return <p className="company-members__empty">{content.empty}</p>

    return (
      <table className="company-members__table">
        <caption className="sr-only">{content.table.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{content.table.member}</th>
            <th scope="col">{content.table.role}</th>
            <th scope="col">{content.table.status}</th>
            <th scope="col">{content.table.joinedAt}</th>
            {canManage ? <th scope="col">{content.table.actions}</th> : null}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isSelf = Boolean(user?.id) && member.userId === user?.id
            const isOwnerRow = isOwnerMember(member)

            return (
              <tr key={member.id}>
                <th data-label={content.table.member} scope="row">
                  <span className="company-members__name">
                    {member.name}
                    {isSelf ? <span className="company-members__you">{content.you}</span> : null}
                  </span>
                  <span className="company-members__email">{member.email}</span>
                </th>
                <td data-label={content.table.role}>
                  {canManage && !isOwnerRow ? (
                    <SelectField
                      compact
                      disabled
                      hideLabel
                      label={fillTemplate(content.changeRoleLabel, { name: member.name })}
                      options={ASSIGNABLE_ROLES.map((role) => ({ label: content.roles[role], value: role }))}
                      value={member.role}
                    />
                  ) : (
                    content.roles[member.role]
                  )}
                </td>
                <td data-label={content.table.status}>
                  <span className={`company-members__status is-${member.status.toLowerCase()}`}>
                    {content.statuses[member.status]}
                  </span>
                </td>
                <td data-label={content.table.joinedAt}>{formatCompanyDate(member.joinedAt, locale)}</td>
                {canManage ? (
                  <td data-label={content.table.actions}>
                    {isOwnerRow ? null : (
                      <button className="recruiter-company-action recruiter-company-action--secondary" disabled type="button">
                        {content.removeAction}
                        <span className="sr-only">: {member.name}</span>
                      </button>
                    )}
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div className="company-members">
      {isPlanLocked ? <PlanLock access={access} description={content.suspendedNotice} title={content.title} /> : null}

      <section aria-labelledby="company-members-title" className="recruiter-company-panel">
        <div className="recruiter-company-panel__header">
          <h2 id="company-members-title">{content.title}</h2>
          <p>{content.description}</p>
        </div>

        {canManage && seatLimit ? (
          <dl aria-label={content.quotaLabel} className="company-members__quota">
            {ASSIGNABLE_ROLES.map((role) => (
              <div key={role}>
                <dt>{quotaLabels[role]}</dt>
                <dd>
                  {countActiveSeats(members, role)}/{seatLimit[role]}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {isPlanLocked && hasSuspended ? (
          <p className="recruiter-company-feedback is-warning">{content.suspendedNotice}</p>
        ) : null}
        {canManage ? <p className="recruiter-company-feedback is-warning">{content.notConnectedNotice}</p> : null}

        {renderList()}
      </section>

      {canManage && seatLimit ? (
        <CompanyMemberAddForm
          isRoleFull={(role) => countActiveSeats(members, role) >= seatLimit[role]}
          roles={ASSIGNABLE_ROLES}
        />
      ) : null}
    </div>
  )
}
