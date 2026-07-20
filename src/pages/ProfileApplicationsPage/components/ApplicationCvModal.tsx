import { useEffect, useRef } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateApplication } from '../types'

type ApplicationCvModalProps = {
  application: CandidateApplication
  labels: ProfileTranslations['applications']['cvPreview']
  onClose: () => void
  profile: ProfileTranslations['profile']
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ApplicationCvModal({ application, labels, onClose, profile }: ApplicationCvModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const titleId = `application-cv-title-${application.id}`

  useEffect(() => {
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="profile-application-cv-backdrop" onMouseDown={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="profile-application-cv-modal"
        onMouseDown={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
      >
        <header className="profile-application-cv-modal-header">
          <div>
            <span>{labels.title}</span>
            <h2 id={titleId}>{application.cvFileName}</h2>
            <p>{labels.subtitle}</p>
          </div>
          <button
            aria-label={labels.close}
            className="profile-application-cv-modal-close"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">x</span>
          </button>
        </header>

        <article className="profile-application-cv-document">
          <header className="profile-application-cv-document-hero">
            <span>{getInitials(profile.name)}</span>
            <div>
              <h3>{profile.name}</h3>
              <p>{profile.headline}</p>
            </div>
          </header>

          <section className="profile-application-cv-section">
            <h4>{labels.contact}</h4>
            <dl className="profile-application-cv-contact">
              <div>
                <dt>{labels.email}</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>{labels.phone}</dt>
                <dd>{profile.phone}</dd>
              </div>
              <div>
                <dt>{labels.location}</dt>
                <dd>{profile.location}</dd>
              </div>
            </dl>
          </section>

          <section className="profile-application-cv-section">
            <h4>{labels.summary}</h4>
            <p>{profile.summary}</p>
          </section>

          <section className="profile-application-cv-section">
            <h4>{labels.skills}</h4>
            <div className="profile-application-cv-skills">
              {profile.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          <section className="profile-application-cv-section">
            <h4>{labels.experience}</h4>
            <div className="profile-application-cv-timeline">
              {profile.experiences.map((experience) => (
                <div key={experience.id}>
                  <strong>{experience.position}</strong>
                  <span>
                    {experience.company} | {experience.startDate} - {experience.isCurrent ? labels.present : experience.endDate}
                  </span>
                  <p>{experience.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-application-cv-section">
            <h4>{labels.education}</h4>
            <div className="profile-application-cv-timeline">
              {profile.education.map((education) => (
                <div key={education.id}>
                  <strong>{education.degree}</strong>
                  <span>
                    {education.school} | {education.startYear} - {education.endYear}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}
