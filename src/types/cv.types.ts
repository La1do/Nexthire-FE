import React from 'react';
import type { SectionConfig, SectionKey } from '../constants/TemplateCVsections';

export interface Experience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  id: string;
  schoolName: string;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}



export interface Activity {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  description: string;
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface CvData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    avatar?: string;
  };
  summary: string;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  activities: Activity[];
  certifications: Certification[];
  awards: Award[];
  references: Reference[];
  interests: Interest[];
}

export type CvLanguage = 'vi' | 'en' | 'ja' | 'zh';
export type CvLayout = 'one-column' | 'two-column';
export type PhotoPosition = 'left' | 'right';

export interface CvSettings {
  themeColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: number;
  language: CvLanguage;
  layout: CvLayout;
  photoPosition: PhotoPosition;
  fontScale: number;
}

export interface CvTemplateProps {
  data: CvData;
  settings: CvSettings;
  sections: SectionConfig[];
  mode?: 'full' | 'header' | 'section';
  sectionKey?: SectionKey;
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

export interface CvTemplate {
  id: string;
  name: string;
  categories: string[];
  thumbnail: string;
  component: React.ComponentType<CvTemplateProps>;
}