import { useId, useState } from 'react'
import { useTranslations } from '../../../i18n'
import { SelectField } from '../../_components'
import { isAssignableRole } from '../memberRoles'
import type { AssignableRole } from '../memberRoles'

type CompanyMemberAddFormProps = {
  isRoleFull: (role: AssignableRole) => boolean
  roles: ReadonlyArray<AssignableRole>
}

/**
 * Add-member form. TODO(A1): no add-member service exists yet, so the whole form is disabled
 * and never pretends to submit.
 */
export function CompanyMemberAddForm({ isRoleFull, roles }: CompanyMemberAddFormProps) {
  const { pages } = useTranslations()
  const content = pages.recruiterCompany.members
  const titleId = useId()
  const [role, setRole] = useState<AssignableRole | undefined>(roles[0])
  const roleFull = role ? isRoleFull(role) : false

  return (
    <section aria-labelledby={titleId} className="recruiter-company-panel company-members__add">
      <div className="recruiter-company-panel__header">
        <h2 id={titleId}>{content.add.title}</h2>
        <p>{content.add.description}</p>
      </div>
      <form className="company-members__add-form" onSubmit={(event) => event.preventDefault()}>
        <fieldset disabled>
          <label className="recruiter-company-field">
            <span>{content.add.nameLabel}</span>
            <input
              autoComplete="name"
              className="recruiter-company-field__control"
              name="name"
              placeholder={content.add.namePlaceholder}
              type="text"
            />
          </label>
          <label className="recruiter-company-field">
            <span>{content.add.emailLabel}</span>
            <input
              autoComplete="email"
              className="recruiter-company-field__control"
              name="email"
              placeholder={content.add.emailPlaceholder}
              type="email"
            />
          </label>
          <div className="recruiter-company-field">
            <SelectField
              disabled
              label={content.add.roleLabel}
              onChange={(value) => {
                if (isAssignableRole(value)) setRole(value)
              }}
              options={roles.map((item) => ({ label: content.roles[item], value: item }))}
              value={role ?? ''}
            />
            {roleFull ? <small>{content.add.quotaFull}</small> : null}
          </div>
          <button className="recruiter-company-action recruiter-company-action--primary" type="submit">
            {content.add.submit}
          </button>
        </fieldset>
      </form>
    </section>
  )
}
