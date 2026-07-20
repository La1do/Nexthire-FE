import { create } from 'zustand';
import type {
  CvData,
  CvSettings as BaseCvSettings,
  Experience,
  Education,
  Skill,
  Activity,
  Certification,
  Award,
  Reference,
  Interest,
} from './../../../types/cv.types';
import {
  DEFAULT_SECTIONS,
  type SectionConfig,
  type SectionKey,
  type CvLanguage,
} from '../../../constants/TemplateCVsections';

export type BuilderTab =
  | 'content'
  | 'design'
  | 'layout'
  | 'sections'
  | 'templates'
  | 'ai'
  | 'library';

export type CvLayout = 'one-column' | 'two-column';
export type PhotoPosition = 'left' | 'right';


export interface CvSettings extends BaseCvSettings {
  language: CvLanguage;
  layout: CvLayout;
  photoPosition: PhotoPosition;
  fontScale: number; 
}

const initialData: CvData = {
  personalInfo: {
    fullName: 'Lê Đức Khánh',
    jobTitle: 'Kỹ sư phần mềm',
    email: 'leduckhanh@gmail.com',
    phone: '0123 456 789',
    address: 'Quận Cầu Giấy, Hà Nội',
  },

  summary:
    'Kỹ sư phần mềm với hơn 4 năm kinh nghiệm trong lĩnh vực phát triển phần mềm và ứng dụng thương mại.',

  experiences: [
    {
      id: 'exp-1',
      companyName: 'Công ty Cổ phần TopCV',
      position: 'Senior Frontend Developer',
      startDate: '01/2022',
      endDate: 'Hiện tại',
      isCurrent: true,
      description:
        '- Tham gia phát triển sản phẩm với hàng triệu người dùng.\n- Tối ưu hiệu năng ứng dụng React.\n- Hướng dẫn và review code cho thành viên mới.',
    },
  ],

  educations: [
    {
      id: 'edu-1',
      schoolName: 'Đại học Bách Khoa Hà Nội',
      major: 'Khoa Công nghệ Thông tin',
      startDate: '2016',
      endDate: '2020',
      description: 'Tốt nghiệp loại Khá.',
    },
  ],

  skills: [
    { id: 'sk-1', name: 'ReactJS / NextJS', level: 'Thành thạo' },
    { id: 'sk-2', name: 'TypeScript', level: 'Thành thạo' },
    { id: 'sk-3', name: 'Node.js', level: 'Khá' },
    { id: 'sk-4', name: 'PostgreSQL', level: 'Khá' },
  ],

  activities: [
    {
      id: 'act-1',
      name: 'Câu lạc bộ Công nghệ',
      role: 'Thành viên',
      startDate: '2021',
      endDate: '2023',
      description:
        'Tham gia tổ chức workshop và hỗ trợ các cuộc thi lập trình.',
    },
  ],

  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: '06/2023',
      description: 'Chứng chỉ nền tảng về điện toán đám mây AWS.',
    },
  ],

  awards: [
    {
      id: 'award-1',
      name: 'Sinh viên xuất sắc',
      issuer: 'Đại học Bách Khoa Hà Nội',
      date: '2022',
      description: 'Đạt thành tích học tập xuất sắc năm học 2021-2022.',
    },
  ],

  references: [
    {
      id: 'ref-1',
      name: 'Nguyễn Văn A',
      position: 'Technical Lead',
      company: 'TopCV',
      phone: '0988 888 888',
      email: 'vana@topcv.vn',
    },
  ],

  interests: [
    {
      id: 'int-1',
      name: 'Lập trình',
    },
    {
      id: 'int-2',
      name: 'Đọc sách',
    },
    {
      id: 'int-3',
      name: 'Bóng đá',
    },
  ],
};

const initialSettings: CvSettings = {
  themeColor: '#f25555',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 'medium',
  lineHeight: 1.5,
  language: 'vi',
  layout: 'one-column',
  photoPosition: 'left',
  fontScale: 1,
};

interface HistorySnapshot {
  data: CvData;
  settings: CvSettings;
  sections: SectionConfig[];
}

const MAX_HISTORY = 30;

interface CvBuilderState {
  cvName: string;
  templateId: string;
  activeTab: BuilderTab;
  data: CvData;
  settings: CvSettings;
  sections: SectionConfig[];
  zoom: number;

  past: HistorySnapshot[];
  future: HistorySnapshot[];

  setCvName: (name: string) => void;
  setTemplateId: (id: string) => void;
  setActiveTab: (tab: BuilderTab) => void;

  setSettings: (settings: CvSettings) => void;
  updateSetting: <K extends keyof CvSettings>(key: K, value: CvSettings[K]) => void;

  updatePersonalInfo: (info: Partial<CvData['personalInfo']>) => void;
  updateSummary: (summary: string) => void;

  addExperience: (exp: Experience) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;

  addEducation: (edu: Education) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  addActivity: (item: Activity) => void;
  updateActivity: (id: string, item: Partial<Activity>) => void;
  removeActivity: (id: string) => void;

  addCertification: (item: Certification) => void;
  updateCertification: (id: string, item: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  addAward: (item: Award) => void;
  updateAward: (id: string, item: Partial<Award>) => void;
  removeAward: (id: string) => void;

  addReference: (item: Reference) => void;
  updateReference: (id: string, item: Partial<Reference>) => void;
  removeReference: (id: string) => void;

  addInterest: (item: Interest) => void;
  updateInterest: (id: string, item: Partial<Interest>) => void;
  removeInterest: (id: string) => void;

  toggleSection: (key: SectionKey) => void;
  moveSectionUp: (key: SectionKey) => void;
  moveSectionDown: (key: SectionKey) => void;

  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;

  undo: () => void;
  redo: () => void;
  reorderSections: (activeKey: SectionKey, overKey: SectionKey) => void;
  
}

// Snapshot trạng thái hiện tại trước khi 1 action làm thay đổi data/settings/sections
const snapshot = (state: CvBuilderState): HistorySnapshot => ({
  data: state.data,
  settings: state.settings,
  sections: state.sections,
});

export const useCvBuilderStore = create<CvBuilderState>((set, get) => ({
  cvName: 'CV chưa đặt tên',
  templateId: 'standard-01',
  activeTab: 'content',
  data: initialData,
  settings: initialSettings,
  sections: DEFAULT_SECTIONS,
  zoom: 1,
  past: [],
  future: [],

  setCvName: (cvName) => set({ cvName }),
  setTemplateId: (templateId) => set({ templateId }),
  setActiveTab: (activeTab) => set({ activeTab }),

  setSettings: (settings) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      settings,
    })),

  updateSetting: (key, value) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      settings: { ...state.settings, [key]: value },
    })),

  updatePersonalInfo: (info) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, personalInfo: { ...state.data.personalInfo, ...info } },
    })),

  updateSummary: (summary) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, summary },
    })),

  addExperience: (exp) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, experiences: [...state.data.experiences, exp] },
    })),

  updateExperience: (id, updatedExp) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        experiences: state.data.experiences.map((exp) =>
          exp.id === id ? { ...exp, ...updatedExp } : exp
        ),
      },
    })),

  removeExperience: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, experiences: state.data.experiences.filter((exp) => exp.id !== id) },
    })),

  addEducation: (edu) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, educations: [...state.data.educations, edu] },
    })),

  updateEducation: (id, updatedEdu) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        educations: state.data.educations.map((edu) =>
          edu.id === id ? { ...edu, ...updatedEdu } : edu
        ),
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, educations: state.data.educations.filter((edu) => edu.id !== id) },
    })),

  addSkill: (skill) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, skills: [...state.data.skills, skill] },
    })),

  updateSkill: (id, updatedSkill) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        skills: state.data.skills.map((sk) => (sk.id === id ? { ...sk, ...updatedSkill } : sk)),
      },
    })),

  removeSkill: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, skills: state.data.skills.filter((sk) => sk.id !== id) },
    })),

  addActivity: (item) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, activities: [...state.data.activities, item] },
    })),

  updateActivity: (id, updatedItem) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        activities: state.data.activities.map((it) => (it.id === id ? { ...it, ...updatedItem } : it)),
      },
    })),

  removeActivity: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, activities: state.data.activities.filter((it) => it.id !== id) },
    })),

  addCertification: (item) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, certifications: [...state.data.certifications, item] },
    })),

  updateCertification: (id, updatedItem) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        certifications: state.data.certifications.map((it) =>
          it.id === id ? { ...it, ...updatedItem } : it
        ),
      },
    })),

  removeCertification: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, certifications: state.data.certifications.filter((it) => it.id !== id) },
    })),

  addAward: (item) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, awards: [...state.data.awards, item] },
    })),

  updateAward: (id, updatedItem) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        awards: state.data.awards.map((it) => (it.id === id ? { ...it, ...updatedItem } : it)),
      },
    })),

  removeAward: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, awards: state.data.awards.filter((it) => it.id !== id) },
    })),

  addReference: (item) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, references: [...state.data.references, item] },
    })),

  updateReference: (id, updatedItem) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        references: state.data.references.map((it) => (it.id === id ? { ...it, ...updatedItem } : it)),
      },
    })),

  removeReference: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, references: state.data.references.filter((it) => it.id !== id) },
    })),

  addInterest: (item) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, interests: [...state.data.interests, item] },
    })),

  updateInterest: (id, updatedItem) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: {
        ...state.data,
        interests: state.data.interests.map((it) => (it.id === id ? { ...it, ...updatedItem } : it)),
      },
    })),

  removeInterest: (id) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      data: { ...state.data, interests: state.data.interests.filter((it) => it.id !== id) },
    })),

  toggleSection: (key) =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      sections: state.sections.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)),
    })),

  moveSectionUp: (key) =>
    set((state) => {
      const idx = state.sections.findIndex((s) => s.key === key);
      if (idx <= 0) return state;
      const next = [...state.sections];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { past: [...state.past, snapshot(state)].slice(-MAX_HISTORY), future: [], sections: next };
    }),

  moveSectionDown: (key) =>
    set((state) => {
      const idx = state.sections.findIndex((s) => s.key === key);
      if (idx === -1 || idx === state.sections.length - 1) return state;
      const next = [...state.sections];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return { past: [...state.past, snapshot(state)].slice(-MAX_HISTORY), future: [], sections: next };
    }),

  setZoom: (zoom) => set({ zoom: Math.min(1.5, Math.max(0.5, zoom)) }),
  zoomIn: () => set((state) => ({ zoom: Math.min(1.5, +(state.zoom + 0.1).toFixed(2)) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(0.5, +(state.zoom - 0.1).toFixed(2)) })),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    set({
      past: state.past.slice(0, -1),
      future: [snapshot(state), ...state.future].slice(0, MAX_HISTORY),
      data: previous.data,
      settings: previous.settings,
      sections: previous.sections,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[0];
    set({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: state.future.slice(1),
      data: next.data,
      settings: next.settings,
      sections: next.sections,
    });
  },

  reorderSections: (activeKey, overKey) =>
  set((state) => {
    const oldIndex = state.sections.findIndex((s) => s.key === activeKey);
    const newIndex = state.sections.findIndex((s) => s.key === overKey);
    if (oldIndex === -1 || newIndex === -1) return state;

    const next = [...state.sections];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);

    return {
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
      sections: next,
    };
  }),
}));