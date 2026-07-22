import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';


import {
  useCvBuilderStore,
} from '../../store/useCvBuilderStore';

import {
  buildCvBlocks,
} from '../../../_components/cv-templates/pagination/buildCvBlocks';

import {
  paginateCvBlocks,
} from '../../../_components/cv-templates/pagination/paginateCvBlocks';

import {
  getPaginatedTemplate,
} from '../../../_components/cv-templates/pagination/PaginatedTemplateRegistry';

import {
  CV_PAGE_HEIGHT,
  CV_PAGE_WIDTH,
} from './../../../../types/cvPagination.types';

import type {
  CvActions,
  CvMeasuredBlock,
  CvPage,
} from './../../../../types/cvPagination.types';

export const PaginatedPreview =
  () => {
    const templateId =
      useCvBuilderStore(
        (state) =>
          state.templateId,
      );

    const data =
      useCvBuilderStore(
        (state) => state.data,
      );

    const settings =
      useCvBuilderStore(
        (state) =>
          state.settings,
      );

    const sections =
      useCvBuilderStore(
        (state) =>
          state.sections,
      );

    const updatePersonalInfo =
      useCvBuilderStore(
        (state) =>
          state.updatePersonalInfo,
      );

    const updateSummary =
      useCvBuilderStore(
        (state) =>
          state.updateSummary,
      );

    const addExperience =
      useCvBuilderStore(
        (state) =>
          state.addExperience,
      );

    const updateExperience =
      useCvBuilderStore(
        (state) =>
          state.updateExperience,
      );

    const removeExperience =
      useCvBuilderStore(
        (state) =>
          state.removeExperience,
      );

    const addEducation =
      useCvBuilderStore(
        (state) =>
          state.addEducation,
      );

    const updateEducation =
      useCvBuilderStore(
        (state) =>
          state.updateEducation,
      );

    const removeEducation =
      useCvBuilderStore(
        (state) =>
          state.removeEducation,
      );

    const addSkill =
      useCvBuilderStore(
        (state) =>
          state.addSkill,
      );

    const updateSkill =
      useCvBuilderStore(
        (state) =>
          state.updateSkill,
      );

    const removeSkill =
      useCvBuilderStore(
        (state) =>
          state.removeSkill,
      );

    const addActivity =
      useCvBuilderStore(
        (state) =>
          state.addActivity,
      );

    const updateActivity =
      useCvBuilderStore(
        (state) =>
          state.updateActivity,
      );

    const removeActivity =
      useCvBuilderStore(
        (state) =>
          state.removeActivity,
      );

    const addCertification =
      useCvBuilderStore(
        (state) =>
          state.addCertification,
      );

    const updateCertification =
      useCvBuilderStore(
        (state) =>
          state.updateCertification,
      );

    const removeCertification =
      useCvBuilderStore(
        (state) =>
          state.removeCertification,
      );

    const addAward =
      useCvBuilderStore(
        (state) =>
          state.addAward,
      );

    const updateAward =
      useCvBuilderStore(
        (state) =>
          state.updateAward,
      );

    const removeAward =
      useCvBuilderStore(
        (state) =>
          state.removeAward,
      );

    const addReference =
      useCvBuilderStore(
        (state) =>
          state.addReference,
      );

    const updateReference =
      useCvBuilderStore(
        (state) =>
          state.updateReference,
      );

    const removeReference =
      useCvBuilderStore(
        (state) =>
          state.removeReference,
      );

    const addInterest =
      useCvBuilderStore(
        (state) =>
          state.addInterest,
      );

    const updateInterest =
      useCvBuilderStore(
        (state) =>
          state.updateInterest,
      );

    const removeInterest =
      useCvBuilderStore(
        (state) =>
          state.removeInterest,
      );

    const actions =
      useMemo<CvActions>(
        () => ({
          updatePersonalInfo,
          updateSummary,

          addExperience,
          updateExperience,
          removeExperience,

          addEducation,
          updateEducation,
          removeEducation,

          addSkill,
          updateSkill,
          removeSkill,

          addActivity,
          updateActivity,
          removeActivity,

          addCertification,
          updateCertification,
          removeCertification,

          addAward,
          updateAward,
          removeAward,

          addReference,
          updateReference,
          removeReference,

          addInterest,
          updateInterest,
          removeInterest,
        }),
        [
          updatePersonalInfo,
          updateSummary,

          addExperience,
          updateExperience,
          removeExperience,

          addEducation,
          updateEducation,
          removeEducation,

          addSkill,
          updateSkill,
          removeSkill,

          addActivity,
          updateActivity,
          removeActivity,

          addCertification,
          updateCertification,
          removeCertification,

          addAward,
          updateAward,
          removeAward,

          addReference,
          updateReference,
          removeReference,

          addInterest,
          updateInterest,
          removeInterest,
        ],
      );

    const measureRef =
      useRef<HTMLDivElement>(
        null,
      );

    const [
      measurements,
      setMeasurements,
    ] = useState<
      CvMeasuredBlock[]
    >([]);
    
    const template =
      useMemo(
        () =>
          getPaginatedTemplate(
            templateId,
          ),
        [templateId],
      );

    const blocks =
      useMemo(
        () =>
          buildCvBlocks({
            data,
            sections,
            editable: true,
          }),
        [data, sections],
      );

    const blockSignature =
      useMemo(
        () =>
          blocks
            .map(
              (block) =>
                block.id,
            )
            .join('|'),
        [blocks],
      );

    useLayoutEffect(() => {
      const container =
        measureRef.current;

      if (!container) {
        return;
      }

      let firstFrame = 0;
      let secondFrame = 0;

      const measure = () => {
        cancelAnimationFrame(
          firstFrame,
        );

        cancelAnimationFrame(
          secondFrame,
        );

        firstFrame =
          requestAnimationFrame(
            () => {
              secondFrame =
                requestAnimationFrame(
                  () => {
                    const elements =
                      Array.from(
                        container.querySelectorAll<HTMLElement>(
                          '[data-cv-block-id]',
                        ),
                      );

                    const nextMeasurements =
                      elements.map(
                        (element) => ({
                          id:
                            element
                              .dataset
                              .cvBlockId ??
                            '',

                          height:
                            Math.ceil(
                              Math.max(
                                element.getBoundingClientRect()
                                  .height,

                                element
                                  .offsetHeight,

                                element
                                  .scrollHeight,
                              ),
                            ),
                        }),
                      );

                    setMeasurements(
                      nextMeasurements,
                    );
                  },
                );
            },
          );
      };

      measure();

      const resizeObserver =
        new ResizeObserver(
          measure,
        );

      resizeObserver.observe(
        container,
      );

      const mutationObserver =
        new MutationObserver(
          measure,
        );

      mutationObserver.observe(
        container,
        {
          childList: true,
          subtree: true,
          characterData: true,
        },
      );

      container
        .querySelectorAll<HTMLElement>(
          '[data-cv-block-id]',
        )
        .forEach((element) => {
          resizeObserver.observe(
            element,
          );
        });

      void document.fonts?.ready.then(
        measure,
      );

      return () => {
        cancelAnimationFrame(
          firstFrame,
        );

        cancelAnimationFrame(
          secondFrame,
        );

        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, [
      blockSignature,
      template,
      settings,
    ]);

    const paginationResult =
      useMemo(
        () =>
          paginateCvBlocks({
            blocks,
            measurements,
          }),
        [blocks, measurements],
      );

    const [
      stablePages,
      setStablePages,
    ] = useState<CvPage[]>(
      [],
    );

    useLayoutEffect(() => {
      if (
        paginationResult
          .unresolvedBlockIds
          .length > 0
      ) {
        return;
      }

      if (
        paginationResult.pages
          .length === 0
      ) {
        return;
      }

      setStablePages(
        paginationResult.pages,
      );
    }, [paginationResult]);

    const displayedPages =
      stablePages.length > 0
        ? stablePages
        : paginationResult.pages;

    const {
      PageRenderer,
      MeasureRenderer,
    } = template;

    return (
      <>
        <div
          ref={measureRef}
          aria-hidden
          className="
            pointer-events-none
            fixed
            left-[-100000px]
            top-0
            opacity-0
          "
          style={{
            width: CV_PAGE_WIDTH,
          }}
        >
          <MeasureRenderer
            blocks={blocks}
            data={data}
            settings={settings}
            sections={sections}
            editable
            mode="measure"
            actions={{}}
          />
        </div>

        <div
          id="cv-pdf-pages"
          className="
            flex
            flex-col
            items-center
            gap-8
          "
        >
          {displayedPages.map(
            (page) => (
              <div
                key={page.id}
                className="relative"
              >
                <span
                  data-html2canvas-ignore="true"
                  className="
                    absolute
                    -top-6
                    right-0
                    rounded-full
                    bg-[#10b981]
                    px-2
                    py-0.5
                    text-xs
                    font-medium
                    text-white
                    shadow-sm
                  "
                >
                  Trang{' '}
                  {page.index + 1}
                </span>

                <div
                  data-cv-page-content
                  data-cv-page-id={
                    page.id
                  }
                  className="
                    overflow-hidden
                    bg-white
                    shadow-2xl
                  "
                  style={{
                    width:
                      CV_PAGE_WIDTH,

                    height:
                      CV_PAGE_HEIGHT,
                  }}
                >
                  <PageRenderer
                    page={page}
                    data={data}
                    settings={settings}
                    sections={sections}
                    editable
                    mode="edit"
                    actions={actions}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </>
    );
  };

export default PaginatedPreview;