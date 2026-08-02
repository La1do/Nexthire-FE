import { useEffect, useState } from 'react'
import { SelectField } from '../../_components'

export type SettingsSection = {
  id: string
  label: string
}

type SettingsSectionNavProps = {
  label: string
  sections: ReadonlyArray<SettingsSection>
}

function scrollToSection(id: string) {
  const section = document.getElementById(id)

  if (!section) {
    return
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  section.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
}

export function SettingsSectionNav({ label, sections }: SettingsSectionNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      {
        rootMargin: '-18% 0px -64% 0px',
        threshold: [0, 0.25, 0.5, 0.75],
      },
    )

    sections.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) {
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <aside aria-label={label} className="recruiter-settings-nav">
      <div className="recruiter-settings-nav__mobile">
        <SelectField
          id="recruiter-settings-section"
          label={label}
          onChange={(id) => {
            setActiveSection(id)
            scrollToSection(id)
          }}
          options={sections.map((section) => ({
            label: section.label,
            value: section.id,
          }))}
          value={activeSection}
        />
      </div>

      <nav aria-label={label} className="recruiter-settings-nav__desktop">
        <p>{label}</p>
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                aria-current={activeSection === section.id ? 'location' : undefined}
                href={`#${section.id}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
