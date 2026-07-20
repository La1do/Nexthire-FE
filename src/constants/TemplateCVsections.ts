export type SectionKey =
  | 'summary'
  | 'education'
  | 'experience'
  | 'activities'
  | 'certifications'
  | 'awards'
  | 'skills'
  | 'references'
  | 'interests';

export type CvLanguage = 'vi' | 'en' | 'ja' | 'zh';

export interface SectionConfig {
  key: SectionKey;
  visible: boolean;
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: 'summary', visible: true },
  { key: 'education', visible: true },
  { key: 'experience', visible: true },
  { key: 'activities', visible: true },
  { key: 'certifications', visible: true },
  { key: 'awards', visible: true },
  { key: 'skills', visible: true },
  { key: 'references', visible: true },
  { key: 'interests', visible: true },
];

export const SECTION_LABELS: Record<SectionKey, Record<CvLanguage, string>> = {
  summary: { vi: 'Mục tiêu nghề nghiệp', en: 'Objective', ja: '自己PR', zh: '求职目标' },
  education: { vi: 'Học vấn', en: 'Education', ja: '学歴', zh: '教育背景' },
  experience: { vi: 'Kinh nghiệm làm việc', en: 'Work Experience', ja: '職務経歴', zh: '工作经历' },
  activities: { vi: 'Hoạt động', en: 'Activities', ja: '活動歴', zh: '活动经历' },
  certifications: { vi: 'Chứng chỉ', en: 'Certifications', ja: '資格', zh: '证书' },
  awards: { vi: 'Danh hiệu và giải thưởng', en: 'Honors & Awards', ja: '受賞歴', zh: '荣誉奖项' },
  skills: { vi: 'Kỹ năng', en: 'Skills', ja: 'スキル', zh: '技能' },
  references: { vi: 'Người giới thiệu', en: 'References', ja: '推薦者', zh: '推荐人' },
  interests: { vi: 'Sở thích', en: 'Interests', ja: '趣味', zh: '兴趣爱好' },
};

export const LANGUAGE_OPTIONS: { value: CvLanguage; label: string }[] = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'zh', label: 'Tiếng Trung' },
];