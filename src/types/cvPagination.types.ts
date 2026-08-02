import type { ComponentType } from 'react';

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
} from './cv.types';

import type {
  SectionConfig,
  SectionKey,
} from './../constants/TemplateCVsections';

export const CV_PAGE_WIDTH = 794;
export const CV_PAGE_HEIGHT = 1123;

export const CV_PAGE_PADDING_TOP = 40;
export const CV_PAGE_PADDING_RIGHT = 40;
export const CV_PAGE_PADDING_BOTTOM = 40;
export const CV_PAGE_PADDING_LEFT = 40;

export const CV_PAGE_CONTENT_HEIGHT =
  CV_PAGE_HEIGHT -
  CV_PAGE_PADDING_TOP -
  CV_PAGE_PADDING_BOTTOM;

export type CvRenderMode =
  | 'measure'
  | 'edit'
  | 'export';

export type CvBlockKind =
  | 'header'
  | 'section-title'
  | 'summary'
  | 'experience-head'
  | 'experience-description'
  | 'education-head'
  | 'education-description'
  | 'skill'
  | 'activity-head'
  | 'activity-description'
  | 'certification-head'
  | 'certification-description'
  | 'award-head'
  | 'award-description'
  | 'reference'
  | 'interest'
  | 'empty'
  | 'add-button';

export interface CvBlock {
  id: string;
  kind: CvBlockKind;

  sectionKey?: SectionKey;
  itemId?: string;
  groupId?: string;

  keepWithNext?: boolean;
  splittable?: boolean;

  text?: string;
  chunkIndex?: number;
  chunkCount?: number;
}

export interface CvMeasuredBlock {
  id: string;
  height: number;
}

export interface CvPage {
  id: string;
  index: number;
  blocks: CvBlock[];
}

export interface CvPaginationResult {
  pages: CvPage[];
  unresolvedBlockIds: string[];
}

export interface CvActions {
  updatePersonalInfo?: (
    info: Partial<CvData['personalInfo']>,
  ) => void;

  updateSummary?: (
    summary: string,
  ) => void;

  addExperience?: (
    item: Experience,
  ) => void;

  updateExperience?: (
    id: string,
    item: Partial<Experience>,
  ) => void;

  removeExperience?: (
    id: string,
  ) => void;

  addEducation?: (
    item: Education,
  ) => void;

  updateEducation?: (
    id: string,
    item: Partial<Education>,
  ) => void;

  removeEducation?: (
    id: string,
  ) => void;

  addSkill?: (
    item: Skill,
  ) => void;

  updateSkill?: (
    id: string,
    item: Partial<Skill>,
  ) => void;

  removeSkill?: (
    id: string,
  ) => void;

  addActivity?: (
    item: Activity,
  ) => void;

  updateActivity?: (
    id: string,
    item: Partial<Activity>,
  ) => void;

  removeActivity?: (
    id: string,
  ) => void;

  addCertification?: (
    item: Certification,
  ) => void;

  updateCertification?: (
    id: string,
    item: Partial<Certification>,
  ) => void;

  removeCertification?: (
    id: string,
  ) => void;

  addAward?: (
    item: Award,
  ) => void;

  updateAward?: (
    id: string,
    item: Partial<Award>,
  ) => void;

  removeAward?: (
    id: string,
  ) => void;

  addReference?: (
    item: Reference,
  ) => void;

  updateReference?: (
    id: string,
    item: Partial<Reference>,
  ) => void;

  removeReference?: (
    id: string,
  ) => void;

  addInterest?: (
    item: Interest,
  ) => void;

  updateInterest?: (
    id: string,
    item: Partial<Interest>,
  ) => void;

  removeInterest?: (
    id: string,
  ) => void;
}

export interface CvTemplateContext {
  data: CvData;
  settings: CvSettings;
  sections: SectionConfig[];

  editable: boolean;
  mode: CvRenderMode;
  actions: CvActions;
}

export interface CvTemplatePageProps
  extends CvTemplateContext {
  page: CvPage;
}

export interface CvTemplateMeasureProps
  extends CvTemplateContext {
  blocks: CvBlock[];
}

export interface PaginatedTemplateDefinition {
  id: string;

  PageRenderer: ComponentType<CvTemplatePageProps>;

  MeasureRenderer: ComponentType<CvTemplateMeasureProps>;
}