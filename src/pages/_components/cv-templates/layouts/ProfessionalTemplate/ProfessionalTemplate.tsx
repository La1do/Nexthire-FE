import type { CSSProperties } from 'react';
import type { CvTemplateProps } from './../../../../../types/cv.types';
import { ProfessionalHeader } from './ProfessionalHeader';
import { ProfessionalSectionRenderer } from './ProfessionalSectionRenderer';

export const ProfessionalTemplate = ({
  data,
  settings,
  sections,
}: CvTemplateProps) => {
  const fontSize =
    settings.fontSize === 'small'
      ? '13px'
      : settings.fontSize === 'large'
      ? '17px'
      : '15px';

  const wrapperStyle: CSSProperties = {
    fontFamily: settings.fontFamily,
    fontSize,
    lineHeight: settings.lineHeight,
  };

  return (
    <div
      className="w-full bg-white p-10 box-border text-[#374151]"
      style={wrapperStyle}
    >
      {/* Header */}
      <div data-header>
        <ProfessionalHeader
          data={data}
          settings={settings}
        />
      </div>

      {/* Sections */}
      {sections
        .filter((section) => section.visible)
        .map((section) => (
          <ProfessionalSectionRenderer
            key={section.key}
            sectionKey={section.key}
            data={data}
            settings={settings}
          />
        ))}
    </div>
  );
};

export default ProfessionalTemplate;