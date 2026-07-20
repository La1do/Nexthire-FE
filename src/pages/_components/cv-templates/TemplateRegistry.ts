import type { CvTemplate } from './../../../types/cv.types';
import { StandardTemplate } from './layouts/StandardTemplate';
import { ProfessionalTemplate } from './layouts/ProfessionalTemplate/ProfessionalTemplate';
import professionalThumbnail from './../../../assets/cv-templates/CV-pro1.jpg'
import { ModernTemplate } from './layouts/ModernTemplate';

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: 'standard-01',
    name: 'Mẫu Tiêu Chuẩn',
    categories: ['it', 'all'],
    thumbnail: professionalThumbnail,
    component: StandardTemplate,
  },
  {
    id: 'professional-01', 
    name: 'Mẫu Chuyên Nghiệp',
    categories: ['it', 'all'],
    thumbnail: professionalThumbnail,
    component: ProfessionalTemplate, 
  },
  {
  id: 'modern-01',
  name: 'Mẫu Hiện Đại',
  categories: ['it', 'all'],
  thumbnail: professionalThumbnail,
  component: ModernTemplate,
  },
];