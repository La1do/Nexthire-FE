type SectionHeadingProps = {
  action?: string
  actionHref?: string
  title: string
}

export function SectionHeading({ action, actionHref = '/search', title }: SectionHeadingProps) {
  return (
    <div className="home-section-heading">
      <h2>{title}</h2>
      {action ? (
        <a href={actionHref}>
          <span>{action}</span>
          <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </div>
  )
}
