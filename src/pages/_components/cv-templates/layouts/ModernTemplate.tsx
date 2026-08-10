import type { ReactNode } from 'react';
import type { CvSettings, CvTemplateProps } from './../../../../types/cv.types';
import type { SectionKey } from './../../../../constants/TemplateCVsections';
import { SECTION_LABELS } from './../../../../constants/TemplateCVsections';
import { EditableText } from './../../../../pages/CvBuilderPage/components/inline/EditableText';


const FONT_SIZE_MAP: Record<CvSettings['fontSize'], { base: string; heading: string; name: string }> = {
  small: { base: 'text-[12px]', heading: 'text-[13px]', name: 'text-[20px]' },
  medium: { base: 'text-[13px]', heading: 'text-[14px]', name: 'text-[24px]' },
  large: { base: 'text-[14px]', heading: 'text-[15px]', name: 'text-[28px]' },
};

export const ModernTemplate = ({
  data,
  settings,
  sections,
  editable = false,
  onUpdatePersonalInfo,
  onUpdateSummary,
}: CvTemplateProps) => {
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
  const sizes = FONT_SIZE_MAP[settings.fontSize];

  const SectionHeading = ({ children }: { children: ReactNode }) => (
    <>
      <h2
        className={`${sizes.heading} mb-2 font-bold uppercase tracking-wide`}
        style={{ color: settings.themeColor }}
      >
        {children}
      </h2>
      <div className="mb-3 h-[2px] w-full" style={{ backgroundColor: settings.themeColor }} />
    </>
  );

  // Render nội dung cho 1 section theo key — đây là điểm mấu chốt cho phép
  // SectionManager (kéo-thả + ẩn/hiện) thật sự tác động lên bản xem trước.
  const renderSection = (key: SectionKey) => {
    const label = SECTION_LABELS[key][settings.language];

    switch (key) {
      case 'summary':
        if (!summary && !editable) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            {editable ? (
              <EditableText
                as="p"
                value={summary}
                onCommit={(v) => onUpdateSummary?.(v)}
                multiline
                className="block text-[#374151]"
                placeholder="Mô tả mục tiêu nghề nghiệp..."
              />
            ) : (
              <p className="text-[#374151]">{summary}</p>
            )}
          </section>
        );

      case 'education':
        if (educations.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="flex flex-col gap-4">
              {educations.map((edu) => (
                <div key={edu.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-[#6b7280]">
                    {edu.startDate} - {edu.endDate}
                  </div>
                  <div className="col-span-3">
                    <p className="font-bold">{edu.schoolName}</p>
                    <p className="text-[#374151]">{edu.major}</p>
                    {edu.description && (
                      <p className="mt-1 whitespace-pre-line text-[#6b7280]">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'experience':
        if (experiences.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="flex flex-col gap-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-[#6b7280]">
                    {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
                  </div>
                  <div className="col-span-3">
                    <p className="font-bold">{exp.companyName}</p>
                    <p className="italic text-[#374151]">{exp.position}</p>
                    {exp.description && (
                      <p className="mt-1 whitespace-pre-line text-[#6b7280]">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'skills':
        if (skills.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between">
                  <span className="text-[#374151]">{skill.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: settings.themeColor }}
                  >
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'activities':
        if (activities.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="flex flex-col gap-4">
              {activities.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-[#6b7280]">
                    {item.startDate} - {item.endDate}
                  </div>
                  <div className="col-span-3">
                    <p className="font-bold">{item.name}</p>
                    {item.role && <p className="italic text-[#374151]">{item.role}</p>}
                    {item.description && (
                      <p className="mt-1 whitespace-pre-line text-[#6b7280]">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (certifications.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="flex flex-col gap-3">
              {certifications.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-[#6b7280]">{item.issueDate}</div>
                  <div className="col-span-3">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-[#374151]">{item.issuer}</p>
                    {item.description && (
                      <p className="mt-1 whitespace-pre-line text-[#6b7280]">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'awards':
        if (awards.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="flex flex-col gap-3">
              {awards.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-[#6b7280]">{item.date}</div>
                  <div className="col-span-3">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-[#374151]">{item.issuer}</p>
                    {item.description && (
                      <p className="mt-1 whitespace-pre-line text-[#6b7280]">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'references':
        if (references.length === 0) return null;
        return (
          <section className="mb-6" key={key}>
            <SectionHeading>{label}</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              {references.map((item) => (
                <div key={item.id}>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[#374151]">
                    {item.position}
                    {item.company ? ` · ${item.company}` : ''}
                  </p>
                  <p className="text-[#6b7280]">
                    {item.phone}
                    {item.phone && item.email ? ' · ' : ''}
                    {item.email}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'interests':
        if (interests.length === 0) return null;
        return (
          <section key={key}>
            <SectionHeading>{label}</SectionHeading>
            <p className="text-[#374151]">{interests.map((i) => i.name).join(' • ')}</p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`h-full w-full bg-white px-10 py-8 text-[#111827] ${sizes.base}`}
      style={{ fontFamily: settings.fontFamily, lineHeight: settings.lineHeight }}
    >
      <div className="flex items-start gap-5 pb-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#e5e7eb]">
          <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-[#9ca3af]">
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" />
          </svg>
        </div>

        <div className="flex-1">
          {editable ? (
            <EditableText
              as="h1"
              value={personalInfo.fullName}
              onCommit={(v) => onUpdatePersonalInfo?.({ fullName: v })}
              className={`${sizes.name} font-bold`}
              placeholder="Họ và tên"
            />
          ) : (
            <h1 className={`${sizes.name} font-bold`} style={{ color: settings.themeColor }}>
              {personalInfo.fullName}
            </h1>
          )}

          {editable ? (
            <EditableText
              as="p"
              value={personalInfo.jobTitle}
              onCommit={(v) => onUpdatePersonalInfo?.({ jobTitle: v })}
              className="mt-1 italic text-[#6b7280]"
              placeholder="Vị trí ứng tuyển"
            />
          ) : (
            <p className="mt-1 italic text-[#6b7280]">{personalInfo.jobTitle}</p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            <p>
              <span className="font-medium text-[#374151]">Điện thoại: </span>
              {editable ? (
                <EditableText
                  value={personalInfo.phone}
                  onCommit={(v) => onUpdatePersonalInfo?.({ phone: v })}
                  placeholder="Số điện thoại"
                />
              ) : (
                personalInfo.phone
              )}
            </p>
            <p>
              <span className="font-medium text-[#374151]">Email: </span>
              {editable ? (
                <EditableText
                  value={personalInfo.email}
                  onCommit={(v) => onUpdatePersonalInfo?.({ email: v })}
                  placeholder="Email"
                />
              ) : (
                personalInfo.email
              )}
            </p>
            <p className="sm:col-span-2">
              <span className="font-medium text-[#374151]">Địa chỉ: </span>
              {editable ? (
                <EditableText
                  value={personalInfo.address}
                  onCommit={(v) => onUpdatePersonalInfo?.({ address: v })}
                  placeholder="Địa chỉ"
                />
              ) : (
                personalInfo.address
              )}
            </p>
          </div>
        </div>
      </div>
      {sections.filter((s) => s.visible).map((s) => renderSection(s.key))}
    </div>
  );
};

export default ModernTemplate;