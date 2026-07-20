import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCvBuilderStore } from '../../store/useCvBuilderStore';
import { CvRenderer } from '../../../_components/cv-templates/CvRenderer';
import type { SectionKey } from './../../../../constants/TemplateCVsections';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_TOP_GAP = 24;

type SectionGaps = Partial<Record<SectionKey, number>>;

const areGapsEqual = (
  current: SectionGaps,
  next: SectionGaps,
) => {
  const keys = new Set<SectionKey>([
    ...(Object.keys(current) as SectionKey[]),
    ...(Object.keys(next) as SectionKey[]),
  ]);

  for (const key of keys) {
    if ((current[key] ?? 0) !== (next[key] ?? 0)) {
      return false;
    }
  }

  return true;
};

export const PaginatedPreview = () => {
  const templateId = useCvBuilderStore(
    (state) => state.templateId,
  );
  const data = useCvBuilderStore((state) => state.data);
  const settings = useCvBuilderStore(
    (state) => state.settings,
  );
  const sections = useCvBuilderStore(
    (state) => state.sections,
  );

  const updatePersonalInfo = useCvBuilderStore(
    (state) => state.updatePersonalInfo,
  );
  const updateSummary = useCvBuilderStore(
    (state) => state.updateSummary,
  );
  const updateExperience = useCvBuilderStore(
    (state) => state.updateExperience,
  );
  const updateEducation = useCvBuilderStore(
    (state) => state.updateEducation,
  );
  const updateSkill = useCvBuilderStore(
    (state) => state.updateSkill,
  );
  const updateActivity = useCvBuilderStore(
    (state) => state.updateActivity,
  );
  const updateCertification = useCvBuilderStore(
    (state) => state.updateCertification,
  );
  const updateAward = useCvBuilderStore(
    (state) => state.updateAward,
  );
  const updateReference = useCvBuilderStore(
    (state) => state.updateReference,
  );
  const updateInterest = useCvBuilderStore(
    (state) => state.updateInterest,
  );

  const measureRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(1);
  const [sectionGaps, setSectionGaps] =
    useState<SectionGaps>({});

  const visibleSections = useMemo(
    () => sections.filter((section) => section.visible),
    [sections],
  );

  const paginationCss = useMemo(() => {
    const gapRules = visibleSections
      .map((section) => {
        const gap = sectionGaps[section.key] ?? 0;

        if (gap <= 0) {
          return '';
        }

        return `
          .cv-pagination-preview [data-section="${section.key}"] {
            padding-top: ${gap + PAGE_TOP_GAP}px;
          }
        `;
      })
      .join('\n');

    return `
      .cv-pagination-document [data-section] {
        display: flow-root;
        box-sizing: border-box;
      }

      ${gapRules}
    `;
  }, [sectionGaps, visibleSections]);

  useLayoutEffect(() => {
    const measureContainer = measureRef.current;

    if (!measureContainer) {
      return;
    }

    let animationFrameId = 0;

    const calculatePagination = () => {
      cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const documentElement =
          measureContainer.firstElementChild as HTMLElement | null;

        if (!documentElement) {
          setSectionGaps({});
          setPageCount(1);
          return;
        }

        const documentRect =
          documentElement.getBoundingClientRect();

        const sectionElements = Array.from(
          documentElement.querySelectorAll<HTMLElement>(
            '[data-section]',
          ),
        );

        const nextGaps: SectionGaps = {};

        let accumulatedGap = 0;

        sectionElements.forEach((sectionElement) => {
          const sectionKey = sectionElement.dataset
            .section as SectionKey | undefined;

          if (!sectionKey) {
            return;
          }

          const sectionRect =
            sectionElement.getBoundingClientRect();

          const originalTop =
            sectionRect.top - documentRect.top;

          const adjustedTop =
            originalTop + accumulatedGap;

          const sectionHeight = Math.ceil(
            sectionRect.height,
          );

          const positionInPage =
            ((adjustedTop % PAGE_HEIGHT) + PAGE_HEIGHT) %
            PAGE_HEIGHT;

          const remainingHeight =
            positionInPage === 0
              ? PAGE_HEIGHT
              : PAGE_HEIGHT - positionInPage;

          let gap = 0;

          /*
           * Section vừa một trang nhưng không còn đủ chỗ
           * ở trang hiện tại thì đẩy nguyên section sang
           * đầu trang tiếp theo.
           *
           * Section lớn hơn PAGE_HEIGHT vẫn phải cho phép
           * bị chia vì không thể đặt trọn trong một trang.
           */
          if (
            positionInPage > 0 &&
            sectionHeight <= PAGE_HEIGHT &&
            sectionHeight > remainingHeight
          ) {
            gap = remainingHeight;
          }

          nextGaps[sectionKey] = gap;
          accumulatedGap += gap;
        });

        const totalHeight =
          documentElement.scrollHeight + accumulatedGap;

        const nextPageCount = Math.max(
          1,
          Math.ceil(totalHeight / PAGE_HEIGHT),
        );

        setSectionGaps((currentGaps) =>
          areGapsEqual(currentGaps, nextGaps)
            ? currentGaps
            : nextGaps,
        );

        setPageCount((currentPageCount) =>
          currentPageCount === nextPageCount
            ? currentPageCount
            : nextPageCount,
        );
      });
    };

    calculatePagination();

    const resizeObserver = new ResizeObserver(
      calculatePagination,
    );

    const documentElement =
      measureContainer.firstElementChild as HTMLElement | null;

    resizeObserver.observe(measureContainer);

    if (documentElement) {
      resizeObserver.observe(documentElement);

      documentElement
        .querySelectorAll<HTMLElement>('[data-section]')
        .forEach((sectionElement) => {
          resizeObserver.observe(sectionElement);
        });
    }

    void document.fonts?.ready.then(calculatePagination);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [templateId, data, settings, sections]);

  const renderCv = (editable: boolean) => (
    <CvRenderer
      templateId={templateId}
      data={data}
      settings={settings}
      sections={sections}
      editable={editable}
      onUpdatePersonalInfo={
        editable ? updatePersonalInfo : undefined
      }
      onUpdateSummary={
        editable ? updateSummary : undefined
      }
      onUpdateExperience={
        editable ? updateExperience : undefined
      }
      onUpdateEducation={
        editable ? updateEducation : undefined
      }
      onUpdateSkill={
        editable ? updateSkill : undefined
      }
      onUpdateActivity={
        editable ? updateActivity : undefined
      }
      onUpdateCertification={
        editable ? updateCertification : undefined
      }
      onUpdateAward={
        editable ? updateAward : undefined
      }
      onUpdateReference={
        editable ? updateReference : undefined
      }
      onUpdateInterest={
        editable ? updateInterest : undefined
      }
    />
  );

  return (
    <>
      <style>{paginationCss}</style>

      {/* CV ẩn dùng để đo kích thước thật */}
      <div
        ref={measureRef}
        className="cv-pagination-document pointer-events-none absolute left-0 top-0 -z-10"
        style={{
          width: PAGE_WIDTH,
          visibility: 'hidden',
        }}
        aria-hidden
      >
        {renderCv(false)}
      </div>

      {/* Danh sách trang */}
      <div
  id="cv-pdf-pages"
  className="flex flex-col items-center gap-8"
>
  {Array.from({ length: pageCount }).map(
    (_, pageIndex) => (
      <div
        key={pageIndex}
        className="relative"
      >
        <span
          data-html2canvas-ignore="true"
          className="absolute -top-6 right-0 rounded-full bg-[#10b981] px-2 py-0.5 text-xs font-medium text-white shadow-sm"
        >
          Trang {pageIndex + 1}
        </span>

        <div
          data-cv-page-content
          data-cv-page-id={`cv-page-${pageIndex}`}
          className="relative overflow-hidden bg-white shadow-2xl"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          }}
        >
          <div
            className="cv-pagination-document cv-pagination-preview absolute left-0 top-0"
            style={{
              width: PAGE_WIDTH,
              transform: `translateY(-${
                pageIndex * PAGE_HEIGHT
              }px)`,
            }}
          >
            {renderCv(false)}
          </div>
        </div>
      </div>
    ),
  )}
</div>
    </>
  );
};

export default PaginatedPreview;