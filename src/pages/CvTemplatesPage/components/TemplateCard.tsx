import { Link } from 'react-router-dom';

import type {
  CvTemplatesTranslations,
} from '../../../i18n/types';

import type {
  CvTemplateCatalogItem,
  CvTemplateCategory,
} from './../../_components/cv-templates/TemplateCatalog';

interface TemplateCardProps {
  categoryLabels: Record<CvTemplateCategory, string>;
  labels: CvTemplatesTranslations['card'];
  template: CvTemplateCatalogItem;
}

export const TemplateCard = ({
  categoryLabels,
  labels,
  template,
}: TemplateCardProps) => {
  const categories = template.categories.filter(
    (category) => category !== 'all',
  );
  const visibleCategories = categories.slice(0, 1);
  const hiddenCategoryCount = categories.length - visibleCategories.length;

  return (
    <article className="cv-template-card">
      <Link
        aria-label={labels.previewAlt.replace('{{name}}', template.name)}
        className="cv-template-card__media"
        to={`/cv-builder/${template.id}`}
      >
        <img
          alt=""
          decoding="async"
          src={template.thumbnail}
        />
      </Link>

      <div className="cv-template-card__body">
        <div className="cv-template-card__title-row">
          <h2>{template.name}</h2>
          <span>{labels.readyLabel}</span>
        </div>

        <p className="cv-template-card__description">{template.description}</p>

        <dl className="cv-template-card__meta">
          <dt>{labels.categoriesLabel}</dt>
          <dd>
            {visibleCategories.map((category) => (
              <span key={category}>{categoryLabels[category]}</span>
            ))}
            {hiddenCategoryCount > 0 ? <span>+{hiddenCategoryCount}</span> : null}
          </dd>
        </dl>

        <Link className="cv-template-card__action" to={`/cv-builder/${template.id}`}>
          <span>{labels.useTemplate}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};

export default TemplateCard;
