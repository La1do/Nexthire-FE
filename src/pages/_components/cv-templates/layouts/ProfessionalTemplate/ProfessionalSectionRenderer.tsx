import type { ReactNode } from 'react';
import type { CvTemplateProps } from './../../../../../types/cv.types';
import type { SectionKey } from './../../../../../constants/TemplateCVsections';
import { SECTION_LABELS } from './../../../../../constants/TemplateCVsections';

interface ProfessionalSectionRendererProps {
  sectionKey: SectionKey;
  data: CvTemplateProps['data'];
  settings: CvTemplateProps['settings'];
}

export const ProfessionalSectionRenderer = ({
  sectionKey,
  data,
  settings,
}: ProfessionalSectionRendererProps) => {
  const {
    summary,
    experiences,
    educations,
    skills,
    activities,
    certifications,
    awards,
    references,
    interests,
  } = data;

  const label = SECTION_LABELS[sectionKey][settings.language];

  const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h3
      className="text-lg font-bold uppercase mb-4"
      style={{ color: settings.themeColor }}
    >
      {children}
    </h3>
  );

  return (
    <section
      data-section={sectionKey}
      className="cv-section break-inside-avoid"
    >
      {(() => {
        switch (sectionKey) {
          case 'summary':
            if (!summary) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <p className="whitespace-pre-wrap text-justify">
                  {summary}
                </p>
              </div>
            );

          case 'experience':
            if (!experiences.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <div className="flex flex-col gap-5">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="relative border-l-2 border-[#d9d9e3] pl-4"
                    >
                      <div
                        className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: settings.themeColor,
                        }}
                      />

                      <div className="mb-1 flex justify-between items-baseline">
                        <h4 className="font-bold text-[#111827]">
                          {exp.position}
                        </h4>

                        <span className="text-sm italic text-[#6b7280]">
                          {exp.startDate} -{' '}
                          {exp.isCurrent ? 'Hiện tại' : exp.endDate}
                        </span>
                      </div>

                      <div className="mb-2 text-sm font-medium">
                        {exp.companyName}
                      </div>

                      <p className="whitespace-pre-wrap text-sm">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'education':
            if (!educations.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <div className="flex flex-col gap-4">
                  {educations.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-[#111827]">
                        {edu.major}
                      </div>

                      <div className="mb-1 text-sm font-medium">
                        {edu.schoolName}
                      </div>

                      <div className="mb-1 text-sm italic text-[#6b7280]">
                        {edu.startDate} - {edu.endDate}
                      </div>

                      <p className="text-sm">
                        {edu.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'skills':
            if (!skills.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <ul className="flex list-disc list-inside flex-col gap-2 text-sm">
                  {skills.map((skill) => (
                    <li key={skill.id}>
                      <span className="font-medium text-[#111827]">
                        {skill.name}
                      </span>

                      {skill.level && (
                        <span className="text-[#6b7280]">
                          {' '}
                          - {skill.level}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );

          case 'activities':
            if (!activities.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <div className="flex flex-col gap-4">
                  {activities.map((item) => (
                    <div key={item.id}>
                      <div className="mb-1 flex justify-between items-baseline">
                        <h4 className="font-bold text-[#111827]">
                          {item.name}
                        </h4>

                        <span className="text-sm italic text-[#6b7280]">
                          {item.startDate} - {item.endDate}
                        </span>
                      </div>

                      {item.role && (
                        <div className="mb-1 text-sm font-medium">
                          {item.role}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
                      case 'certifications':
            if (!certifications.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <div className="flex flex-col gap-3">
                  {certifications.map((item) => (
                    <div key={item.id}>
                      <div className="font-bold text-[#111827]">
                        {item.name}
                      </div>

                      <div className="text-sm">
                        {item.issuer} · {item.issueDate}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'awards':
            if (!awards.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <div className="flex flex-col gap-3">
                  {awards.map((item) => (
                    <div key={item.id}>
                      <div className="font-bold text-[#111827]">
                        {item.name}
                      </div>

                      <div className="text-sm">
                        {item.issuer} · {item.date}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'references':
            if (!references.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  {references.map((item) => (
                    <div key={item.id}>
                      <div className="font-bold text-[#111827]">
                        {item.name}
                      </div>

                      <div className="text-sm">
                        {item.position}
                        {item.company
                          ? ` · ${item.company}`
                          : ''}
                      </div>

                      <div className="text-sm text-[#6b7280]">
                        {item.phone}
                        {item.phone && item.email
                          ? ' · '
                          : ''}
                        {item.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'interests':
            if (!interests.length) return null;

            return (
              <div className="mb-8">
                <SectionTitle>{label}</SectionTitle>

                <p className="text-sm">
                  {interests.map((i) => i.name).join(' • ')}
                </p>
              </div>
            );

          default:
            return null;
        }
      })()}
    </section>
  );
};

export default ProfessionalSectionRenderer;