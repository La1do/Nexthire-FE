import type { ReactNode } from 'react';
import type { CvTemplateProps } from './../../../../types/cv.types';
import type { SectionKey } from './../../../../constants/TemplateCVsections';
import { SECTION_LABELS } from './../../../../constants/TemplateCVsections';

export const StandardTemplate = ({ data, settings, sections }: CvTemplateProps) => {
  const {
    personalInfo,
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

  const fontSize =
    settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '15px' : '13px';

  const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h3
      className="text-sm font-bold uppercase tracking-wide mb-2 border-b pb-1"
      style={{ color: settings.themeColor, borderColor: settings.themeColor }}
    >
      {children}
    </h3>
  );

  const renderSection = (key: SectionKey) => {
    const label = SECTION_LABELS[key][settings.language];

    switch (key) {
      case 'summary':
        if (!summary) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        );

      case 'experience':
        if (!experiences?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <div className="flex flex-col gap-3">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>
                      {exp.position} — {exp.companyName}
                    </span>
                    <span className="font-normal text-gray-500">
                      {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="whitespace-pre-wrap text-gray-600">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!educations?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <div className="flex flex-col gap-3">
              {educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>
                      {edu.major} — {edu.schoolName}
                    </span>
                    <span className="font-normal text-gray-500">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  {edu.description && <p className="text-gray-600">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!skills?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <p>{skills.map((s) => (s.level ? `${s.name} (${s.level})` : s.name)).join(', ')}</p>
          </div>
        );

      case 'activities':
        if (!activities?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <div className="flex flex-col gap-3">
              {activities.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>
                      {item.name}
                      {item.role ? ` — ${item.role}` : ''}
                    </span>
                    <span className="font-normal text-gray-500">
                      {item.startDate} - {item.endDate}
                    </span>
                  </div>
                  {item.description && <p className="text-gray-600">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <div className="flex flex-col gap-2">
              {certifications.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="font-bold text-gray-900">
                    {item.name} — {item.issuer}
                  </span>
                  <span className="text-gray-500">{item.issueDate}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'awards':
        if (!awards?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <div className="flex flex-col gap-2">
              {awards.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="font-bold text-gray-900">
                    {item.name} — {item.issuer}
                  </span>
                  <span className="text-gray-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'references':
        if (!references?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <div className="flex flex-col gap-2">
              {references.map((item) => (
                <div key={item.id}>
                  <span className="font-bold text-gray-900">{item.name}</span> — {item.position}
                  {item.company ? `, ${item.company}` : ''}
                  <div className="text-gray-500">
                    {item.phone} {item.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        if (!interests?.length) return null;
        return (
          <div className="mb-5" key={key}>
            <SectionTitle>{label}</SectionTitle>
            <p>{interests.map((i) => i.name).join(', ')}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="w-full h-full bg-white text-gray-900 p-8"
      style={{ fontFamily: settings.fontFamily, fontSize, lineHeight: settings.lineHeight }}
    >
      <div className="mb-5 border-b pb-4" style={{ borderColor: settings.themeColor }}>
        <h1 className="text-2xl font-bold" style={{ color: settings.themeColor }}>
          {personalInfo.fullName || 'Họ và tên'}
        </h1>
        <p className="text-gray-600">{personalInfo.jobTitle}</p>
        <p className="text-xs text-gray-500 mt-1">
          {[personalInfo.phone, personalInfo.email, personalInfo.address].filter(Boolean).join(' · ')}
        </p>
      </div>

      {sections.filter((s) => s.visible).map((s) => renderSection(s.key))}
    </div>
  );
};

export default StandardTemplate;