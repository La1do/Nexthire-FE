import professionalThumbnail from '../../../assets/cv-templates/CV-pro1.jpg';

export type CvTemplateCategory =
  | 'all'
  | 'it'
  | 'marketing'
  | 'sales'
  | 'hr';

export interface CvTemplateCatalogItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  categories: CvTemplateCategory[];
}

/**
 * Chỉ chứa metadata hiển thị.
 *
 * Renderer thật được đăng ký riêng trong:
 * pagination/PaginatedTemplateRegistry.ts
 */
export const CV_TEMPLATE_CATALOG: CvTemplateCatalogItem[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Mẫu CV chuyên nghiệp, rõ ràng và phù hợp nhiều vị trí.',
    thumbnail: professionalThumbnail,
    categories: [
      'all',
      'it',
      'marketing',
      'sales',
      'hr',
    ],
  },
];

export const getCvTemplateCatalogItem = (
  templateId: string,
): CvTemplateCatalogItem | undefined =>
  CV_TEMPLATE_CATALOG.find(
    (template) =>
      template.id === templateId,
  );
