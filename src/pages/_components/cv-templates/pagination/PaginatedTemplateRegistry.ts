import type {
  PaginatedTemplateDefinition,
} from './../../../../types/cvPagination.types';

import {
  ProfessionalMeasureRenderer,
  ProfessionalPageRenderer,
} from './../layouts/ProfessionalTemplate/ProfessionalBlockRenderer';

export const PAGINATED_TEMPLATES:
  PaginatedTemplateDefinition[] =
  [
    {
      id: 'professional',
      PageRenderer:
        ProfessionalPageRenderer,
      MeasureRenderer:
        ProfessionalMeasureRenderer,
    },
  ];

export const getPaginatedTemplate =
  (
    templateId: string,
  ): PaginatedTemplateDefinition => {
    const template =
      PAGINATED_TEMPLATES.find(
        (item) =>
          item.id ===
          templateId,
      );

    return (
      template ??
      PAGINATED_TEMPLATES[0]
    );
  };