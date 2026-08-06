import {
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { useAsync } from '../../hooks/useAsync';
import { useLocale, useTranslations } from '../../i18n';
import { cvTemplatePresetService } from '../../services/cvTemplatePreset.service';
import type { PublicCvTemplatePreset } from '../../types/cvTemplatePreset.types';
import {
  CV_TEMPLATE_CATALOG,
  type CvTemplateCategory,
} from './../_components/cv-templates/TemplateCatalog';

import {
  TemplateCard,
} from './components/TemplateCard';

import './cv-templates.css';

const CATEGORY_IDS: CvTemplateCategory[] = [
  'all',
  'it',
  'marketing',
  'sales',
  'hr',
];

function formatCount(template: string, count: number) {
  return template.replace('{{count}}', String(count));
}

function firstText(value: Record<'vi' | 'en' | 'ja', string>, locale: string) {
  return value[locale as 'vi' | 'en' | 'ja'] || value.vi || value.en || value.ja
}

function toCatalogItem(
  template: PublicCvTemplatePreset,
  locale: string,
): (typeof CV_TEMPLATE_CATALOG)[number] {
  const fallbackThumbnail =
    CV_TEMPLATE_CATALOG.find((item) => item.id === template.key)?.thumbnail ??
    CV_TEMPLATE_CATALOG[0]?.thumbnail

  return {
    id: template.key,
    name: firstText(template.name, locale),
    description: firstText(template.description, locale),
    thumbnail: template.thumbnailUrl ?? fallbackThumbnail,
    categories:
      template.categories.length > 0
        ? (['all', ...template.categories] as CvTemplateCategory[])
        : ['all'],
  }
}

export function CvTemplatesPage() {
  const { locale } = useLocale();
  const { pages } = useTranslations();
  const content = pages.cvTemplates;
  const presetsState = useAsync(
    () => cvTemplatePresetService.list({ includeCanvas: false }),
    [],
  );

  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState<CvTemplateCategory>(
      'all',
    );

  const templates = useMemo(() => {
    const remote = presetsState.data?.map((template) => toCatalogItem(template, locale)) ?? []
    return remote.length > 0 ? remote : CV_TEMPLATE_CATALOG
  }, [locale, presetsState.data]);

  const categoryItems = useMemo(
    () =>
      CATEGORY_IDS.map((id) => ({
        id,
        count:
          id === 'all'
            ? templates.length
            : templates.filter((template) =>
              template.categories.includes(id),
            ).length,
        label: content.categories[id],
      })),
    [content.categories, templates],
  );

  const filteredTemplates =
    useMemo(
      () =>
        templates.filter(
          (template) =>
            activeCategory ===
              'all' ||
            template.categories.includes(
              activeCategory,
            ),
        ),
      [activeCategory, templates],
    );

  const firstTemplate = templates[0];
  const availableCategoryCount = CATEGORY_IDS.filter((id) => id !== 'all').length;

  return (
    <article className="cv-templates-page">
      <header className="cv-templates-hero">
        <div className="cv-templates-hero__copy">
          <p className="cv-templates-hero__inventory">{content.hero.inventoryLabel}</p>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>
          <div className="cv-templates-hero__actions">
            {firstTemplate ? (
              <Link className="cv-templates-button cv-templates-button--primary" to={`/cv-builder/${firstTemplate.id}`}>
                <span>{content.hero.primaryAction}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            <a className="cv-templates-button cv-templates-button--secondary" href="#cv-template-list">
              <span>{content.hero.secondaryAction}</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <dl className="cv-templates-stats" aria-label={content.routeLabel}>
          <div>
            <dt>{formatCount(content.stats.readyTemplates, templates.length)}</dt>
            <dd>{content.card.readyLabel}</dd>
          </div>
          <div>
            <dt>{formatCount(content.stats.categoryGroups, availableCategoryCount)}</dt>
            <dd>{content.filters.label}</dd>
          </div>
          <div>
            <dt>{content.stats.exportReady}</dt>
            <dd>PDF</dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="cv-template-list-title" className="cv-templates-catalog" id="cv-template-list">
        <div className="cv-templates-section-head">
          <div>
            <h2 id="cv-template-list-title">{content.routeLabel}</h2>
            <p>{formatCount(content.filters.countLabel, filteredTemplates.length)}</p>
          </div>
        </div>

        <div aria-label={content.filters.label} className="cv-templates-filter">
          {categoryItems.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <button
                aria-pressed={isActive}
                className={isActive ? 'is-active' : ''}
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                type="button"
              >
                <span>{category.label}</span>
                <small>{category.count}</small>
              </button>
            );
          })}
        </div>

        {filteredTemplates.length ? (
          <div className="cv-templates-grid">
            {filteredTemplates.map((template) => (
              <TemplateCard
                categoryLabels={content.categories}
                key={template.id}
                labels={content.card}
                template={template}
              />
            ))}
          </div>
        ) : (
          <div className="cv-templates-empty">
            <h3>{content.filters.emptyTitle}</h3>
            <p>{content.filters.emptyDescription}</p>
          </div>
        )}
      </section>

      <section aria-label={content.notes.title} className="cv-templates-support">
        <div className="cv-templates-notes">
          <h2>{content.notes.title}</h2>
          <ul>
            {content.notes.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="cv-templates-upcoming">
          <div>
            <h2>{content.upcoming.title}</h2>
            <p>{content.upcoming.description}</p>
          </div>
          <div className="cv-templates-upcoming__grid">
            {content.upcoming.items.map((item) => (
              <article aria-disabled="true" className="cv-template-upcoming-card" key={item.name}>
                <span>{content.upcoming.badge}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <small>{item.category}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

export default CvTemplatesPage;
