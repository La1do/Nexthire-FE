type SectionHeadingProps = {
  action?: string
  eyebrow?: string
  title: string
}

export function SectionHeading({ action, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="home-section-heading">
      <div>
        {eyebrow ? <p className="home-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {action ? (
        <a href="/">
          {action}
        </a>
      ) : null}
    </div>
  )
}
