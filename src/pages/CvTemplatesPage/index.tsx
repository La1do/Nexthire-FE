import {
  useMemo,
  useState,
} from 'react';

import {
  CV_TEMPLATE_CATALOG,
  type CvTemplateCategory,
} from './../_components/cv-templates/TemplateCatalog';

import {
  TemplateCard,
} from './components/TemplateCard';

interface CategoryItem {
  id: CvTemplateCategory;
  label: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    label: 'Tất cả',
  },
  {
    id: 'it',
    label: 'IT',
  },
  {
    id: 'marketing',
    label: 'Marketing',
  },
  {
    id: 'sales',
    label: 'Sales',
  },
  {
    id: 'hr',
    label: 'Nhân sự',
  },
];

export function CvTemplatesPage() {
  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState<CvTemplateCategory>(
      'all',
    );

  const filteredTemplates =
    useMemo(
      () =>
        CV_TEMPLATE_CATALOG.filter(
          (template) =>
            activeCategory ===
              'all' ||
            template.categories.includes(
              activeCategory,
            ),
        ),
      [activeCategory],
    );

  return (
    <div
      className="
        min-h-screen
        bg-[#f7f6fb]
        px-4
        py-12
        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1
            className="
              mb-4
              text-3xl
              font-bold
              text-[#111827]
              md:text-4xl
            "
          >
            Mẫu CV theo vị trí ứng tuyển
          </h1>

          <p className="text-base text-[#6b7280]">
            Tạo CV ngay - Chốt Job liền tay. Khám phá
            các mẫu thiết kế CV đẹp.
          </p>
        </div>

        <div
          className="
            mb-10
            flex
            flex-wrap
            justify-center
            gap-2
          "
        >
          {CATEGORIES.map(
            (category) => {
              const isActive =
                activeCategory ===
                category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category.id,
                    )
                  }
                  className={`
                    rounded-full
                    border
                    px-5
                    py-2
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      isActive
                        ? `
                          border-[#111827]
                          bg-[#111827]
                          text-white
                        `
                        : `
                          border-[#d9d9e3]
                          bg-white
                          text-[#6b7280]
                          hover:text-[#111827]
                        `
                    }
                  `}
                >
                  {category.label}
                </button>
              );
            },
          )}
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-8
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {filteredTemplates.map(
            (template) => (
              <TemplateCard
                key={template.id}
                template={template}
              />
            ),
          )}
        </div>

        {filteredTemplates.length ===
          0 && (
          <div
            className="
              py-20
              text-center
              text-[#6b7280]
            "
          >
            Không tìm thấy mẫu CV phù hợp với danh mục
            này.
          </div>
        )}
      </div>
    </div>
  );
}

export default CvTemplatesPage;