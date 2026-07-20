import { useTranslations } from '../../i18n'
import type { ComingSoonPageKey } from '../../i18n/types'

type ComingSoonPageProps = {
  pageKey: ComingSoonPageKey
}

export function ComingSoonPage({ pageKey }: ComingSoonPageProps) {
  const { pages } = useTranslations()
  const content = pages.comingSoon
  const pageContent = content.pages[pageKey]

  return (
    <section className="coming-soon-page">
      <div className="coming-soon-card coming-soon-motion">
        <span className="coming-soon-badge">{content.badge}</span>
        <h2 className="coming-soon-title">{pageContent.title}</h2>
        <p className="coming-soon-description">{content.description}</p>
        <p className="coming-soon-detail">{pageContent.description}</p>
        <a className="coming-soon-action" href={pageContent.backHref}>
          {content.backAction} · {pageContent.backLabel}
        </a>
      </div>
    </section>
  )
}

export default ComingSoonPage