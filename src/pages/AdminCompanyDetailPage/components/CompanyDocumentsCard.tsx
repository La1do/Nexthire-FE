import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { AdminCompany } from '../../AdminCompaniesPage/types'

type CompanyDocumentsCardProps = {
  company: AdminCompany
  content: AdminCompaniesTranslations['detail']
}

function FileIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5" />
    </svg>
  )
}

export function CompanyDocumentsCard({ company, content }: CompanyDocumentsCardProps) {
  return (
    <section className="admin-company-panel" aria-labelledby="company-documents-title">
      <header className="admin-company-panel__header">
        <h2 id="company-documents-title">{content.documentsTitle}</h2>
        <p>{content.documentsDescription}</p>
      </header>

      <ul className="admin-company-documents">
        {company.documents.map((document) => (
          <li className="admin-company-document" key={document.id}>
            <span aria-hidden="true" className="admin-company-document__icon">
              <FileIcon />
            </span>
            <span className="admin-company-document__name">{document.name}</span>
            <a className="admin-company-document__download" href={document.href}>
              {content.download}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
