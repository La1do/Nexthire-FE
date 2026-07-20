import type { CvTemplateProps } from './../../../../../types/cv.types';

interface ProfessionalHeaderProps {
  data: CvTemplateProps['data'];
  settings: CvTemplateProps['settings'];
}

export const ProfessionalHeader = ({
  data,
  settings,
}: ProfessionalHeaderProps) => {
  const { personalInfo } = data;

  return (
    <header
      className="cv-header flex items-center justify-between border-b-2 pb-6 mb-6"
      style={{ borderColor: settings.themeColor }}
    >
      <div className="flex-1">
        <h1 className="text-4xl font-bold uppercase tracking-wider text-[#111827]">
          {personalInfo.fullName || 'HỌ VÀ TÊN'}
        </h1>

        <h2
          className="mt-2 text-xl font-medium"
          style={{ color: settings.themeColor }}
        >
          {personalInfo.jobTitle || 'Vị trí ứng tuyển'}
        </h2>
      </div>

      <div className="flex flex-col gap-1 text-right text-sm text-[#374151]">
        {personalInfo.phone && <p>{personalInfo.phone}</p>}

        {personalInfo.email && <p>{personalInfo.email}</p>}

        {personalInfo.address && <p>{personalInfo.address}</p>}
      </div>
    </header>
  );
};

export default ProfessionalHeader;