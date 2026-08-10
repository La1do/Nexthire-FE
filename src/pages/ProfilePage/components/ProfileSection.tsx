import type { ReactNode } from 'react'

type ProfileSectionProps = {
  children: ReactNode
  description: string
  title: string
}

export function ProfileSection({ children, description, title }: ProfileSectionProps) {
  return (
    <section className="profile-section profile-card-motion">
      <div className="profile-section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
