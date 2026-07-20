import { useMemo } from 'react';
import { CV_TEMPLATES } from './TemplateRegistry';

import type {
  CvData,
  CvSettings,
  Experience,
  Education,
  Skill,
  Activity,
  Certification,
  Award,
  Reference,
  Interest,
} from './../../../types/cv.types';

import type { SectionConfig } from './../../../constants/TemplateCVsections';

interface CvRendererProps {
  templateId: string;

  data: CvData;
  settings: CvSettings;
  sections: SectionConfig[];

  editable?: boolean;

  onUpdatePersonalInfo?: (info: Partial<CvData['personalInfo']>) => void;
  onUpdateSummary?: (summary: string) => void;

  onUpdateExperience?: (id: string, exp: Partial<Experience>) => void;
  onUpdateEducation?: (id: string, edu: Partial<Education>) => void;
  onUpdateSkill?: (id: string, skill: Partial<Skill>) => void;
  onUpdateActivity?: (id: string, item: Partial<Activity>) => void;
  onUpdateCertification?: (id: string, item: Partial<Certification>) => void;
  onUpdateAward?: (id: string, item: Partial<Award>) => void;
  onUpdateReference?: (id: string, item: Partial<Reference>) => void;
  onUpdateInterest?: (id: string, item: Partial<Interest>) => void;
}

export const CvRenderer = ({
  templateId,

  data,
  settings,
  sections,

  editable = false,

  onUpdatePersonalInfo,
  onUpdateSummary,

  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateActivity,
  onUpdateCertification,
  onUpdateAward,
  onUpdateReference,
  onUpdateInterest,
}: CvRendererProps) => {
  const TemplateComponent = useMemo(() => {
    const template = CV_TEMPLATES.find((t) => t.id === templateId);

    return template?.component ?? CV_TEMPLATES[0].component;
  }, [templateId]);

  return (
    <TemplateComponent
      data={data}
      settings={settings}
      sections={sections}
      editable={editable}
      onUpdatePersonalInfo={onUpdatePersonalInfo}
      onUpdateSummary={onUpdateSummary}
      onUpdateExperience={onUpdateExperience}
      onUpdateEducation={onUpdateEducation}
      onUpdateSkill={onUpdateSkill}
      onUpdateActivity={onUpdateActivity}
      onUpdateCertification={onUpdateCertification}
      onUpdateAward={onUpdateAward}
      onUpdateReference={onUpdateReference}
      onUpdateInterest={onUpdateInterest}
    />
  );
};

export default CvRenderer;