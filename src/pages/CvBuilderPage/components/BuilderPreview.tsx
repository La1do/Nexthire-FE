import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useCvBuilderStore,
} from '../store/useCvBuilderStore';

import {
  PaginatedPreview,
} from './preview/PaginatedPreview';

const CV_PAGE_WIDTH = 794;
const CV_PAGE_HEIGHT = 1123;

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.4;

const PREVIEW_SIDE_GUTTER = 32;
const PREVIEW_TOP_GUTTER = 28;
const PREVIEW_BOTTOM_GUTTER = 72;

interface ScrollSnapshot {
  top: number;
  left: number;
}

const clampZoom = (
  value: number,
) =>
  Math.min(
    MAX_ZOOM,
    Math.max(MIN_ZOOM, value),
  );

export const BuilderPreview =
  () => {
    const zoom =
      useCvBuilderStore(
        (state) => state.zoom,
      );

    const setZoom =
      useCvBuilderStore(
        (state) =>
          state.setZoom,
      );

    const zoomIn =
      useCvBuilderStore(
        (state) =>
          state.zoomIn,
      );

    const zoomOut =
      useCvBuilderStore(
        (state) =>
          state.zoomOut,
      );

    /*
     * Chỉ thay đổi khi cấu trúc CV thay đổi.
     * Không dùng toàn bộ data object vì khi gõ từng ký tự
     * không cần chạy logic giữ scroll liên tục.
     */
    const structureVersion =
      useCvBuilderStore(
        (state) =>
          [
            state.templateId,

            state.data.experiences
              .map((item) => item.id)
              .join(','),

            state.data.educations
              .map((item) => item.id)
              .join(','),

            state.data.skills
              .map((item) => item.id)
              .join(','),

            state.data.activities
              .map((item) => item.id)
              .join(','),

            state.data.certifications
              .map((item) => item.id)
              .join(','),

            state.data.awards
              .map((item) => item.id)
              .join(','),

            state.data.references
              .map((item) => item.id)
              .join(','),

            state.data.interests
              .map((item) => item.id)
              .join(','),

            state.sections
              .map(
                (section) =>
                  [
                    section.key,
                    section.visible,
                  ].join(':'),
              )
              .join(','),
          ].join('|'),
      );

    const rootRef =
      useRef<HTMLDivElement>(
        null,
      );

    const scrollRef =
      useRef<HTMLDivElement>(
        null,
      );

    const naturalPreviewRef =
      useRef<HTMLDivElement>(
        null,
      );

    const userChangedZoomRef =
      useRef(false);

    const firstFitDoneRef =
      useRef(false);

    const previousStructureRef =
      useRef(structureVersion);

    const scrollSnapshotRef =
      useRef<ScrollSnapshot>({
        top: 0,
        left: 0,
      });

    const restoreFrameOneRef =
      useRef<number>(0);

    const restoreFrameTwoRef =
      useRef<number>(0);

    const [
      viewportWidth,
      setViewportWidth,
    ] = useState(0);

    const [
      naturalPreviewHeight,
      setNaturalPreviewHeight,
    ] = useState(
      CV_PAGE_HEIGHT,
    );

    const readScrollPosition =
      useCallback(() => {
        const container =
          scrollRef.current;

        if (!container) {
          return;
        }

        scrollSnapshotRef.current =
          {
            top:
              container.scrollTop,

            left:
              container.scrollLeft,
          };
      }, []);

    const calculateFitZoom =
      useCallback(() => {
        const container =
          scrollRef.current;

        if (!container) {
          return;
        }

        const availableWidth =
          container.clientWidth -
          PREVIEW_SIDE_GUTTER * 2;

        if (
          availableWidth <= 0
        ) {
          return;
        }

        const nextZoom =
          clampZoom(
            Math.min(
              1,
              availableWidth /
                CV_PAGE_WIDTH,
            ),
          );

        setZoom(nextZoom);
      }, [setZoom]);

    /*
     * Theo dõi kích thước thật của vùng preview.
     */
    useLayoutEffect(() => {
      const container =
        scrollRef.current;

      if (!container) {
        return;
      }

      const updateViewportSize =
        () => {
          setViewportWidth(
            container.clientWidth,
          );
        };

      updateViewportSize();

      const resizeObserver =
        new ResizeObserver(() => {
          updateViewportSize();

          if (
            !userChangedZoomRef.current
          ) {
            calculateFitZoom();
          }
        });

      resizeObserver.observe(
        container,
      );

      return () => {
        resizeObserver.disconnect();
      };
    }, [calculateFitZoom]);

    /*
     * Fit CV khi lần đầu vào trang.
     */
    useLayoutEffect(() => {
      if (
        firstFitDoneRef.current
      ) {
        return;
      }

      const frame =
        requestAnimationFrame(
          () => {
            calculateFitZoom();

            firstFitDoneRef.current =
              true;
          },
        );

      return () => {
        cancelAnimationFrame(
          frame,
        );
      };
    }, [calculateFitZoom]);

    /*
     * Đo chiều cao tự nhiên của danh sách trang,
     * trước khi scale.
     */
    useLayoutEffect(() => {
      const preview =
        naturalPreviewRef.current;

      if (!preview) {
        return;
      }

      const measureHeight = () => {
        const nextHeight =
          Math.max(
            CV_PAGE_HEIGHT,
            preview.scrollHeight,
            preview.offsetHeight,
          );

        setNaturalPreviewHeight(
          nextHeight,
        );
      };

      measureHeight();

      const resizeObserver =
        new ResizeObserver(
          measureHeight,
        );

      resizeObserver.observe(
        preview,
      );

      const mutationObserver =
        new MutationObserver(
          measureHeight,
        );

      mutationObserver.observe(
        preview,
        {
          childList: true,
          subtree: true,
          characterData: true,
        },
      );

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, []);

    /*
     * Lưu vị trí trước khi cấu trúc block thay đổi.
     */
    useLayoutEffect(() => {
      if (
        previousStructureRef.current ===
        structureVersion
      ) {
        return;
      }

      readScrollPosition();

      previousStructureRef.current =
        structureVersion;
    }, [
      structureVersion,
      readScrollPosition,
    ]);

    /*
     * Khôi phục scroll sau khi pagination đo xong.
     */
    useLayoutEffect(() => {
      const container =
        scrollRef.current;

      if (!container) {
        return;
      }

      cancelAnimationFrame(
        restoreFrameOneRef.current,
      );

      cancelAnimationFrame(
        restoreFrameTwoRef.current,
      );

      const snapshot = {
        ...scrollSnapshotRef.current,
      };

      restoreFrameOneRef.current =
        requestAnimationFrame(() => {
          restoreFrameTwoRef.current =
            requestAnimationFrame(
              () => {
                const currentContainer =
                  scrollRef.current;

                if (
                  !currentContainer
                ) {
                  return;
                }

                const maxTop =
                  Math.max(
                    0,
                    currentContainer
                      .scrollHeight -
                      currentContainer
                        .clientHeight,
                  );

                const maxLeft =
                  Math.max(
                    0,
                    currentContainer
                      .scrollWidth -
                      currentContainer
                        .clientWidth,
                  );

                currentContainer.scrollTo({
                  top: Math.min(
                    snapshot.top,
                    maxTop,
                  ),

                  left: Math.min(
                    snapshot.left,
                    maxLeft,
                  ),

                  behavior: 'auto',
                });
              },
            );
        });

      return () => {
        cancelAnimationFrame(
          restoreFrameOneRef.current,
        );

        cancelAnimationFrame(
          restoreFrameTwoRef.current,
        );
      };
    }, [
      structureVersion,
      naturalPreviewHeight,
    ]);

    const handleZoomIn = () => {
      readScrollPosition();

      userChangedZoomRef.current =
        true;

      zoomIn();
    };

    const handleZoomOut = () => {
      readScrollPosition();

      userChangedZoomRef.current =
        true;

      zoomOut();
    };

    const handleFit = () => {
      userChangedZoomRef.current =
        false;

      calculateFitZoom();
    };

    const scaledWidth =
      useMemo(
        () =>
          Math.ceil(
            CV_PAGE_WIDTH * zoom,
          ),
        [zoom],
      );

    const scaledHeight =
      useMemo(
        () =>
          Math.ceil(
            naturalPreviewHeight *
              zoom,
          ),
        [
          naturalPreviewHeight,
          zoom,
        ],
      );

    /*
     * Canvas luôn rộng ít nhất bằng viewport.
     *
     * Khi CV nhỏ:
     * canvasWidth = viewportWidth
     * → CV căn giữa.
     *
     * Khi CV lớn:
     * canvasWidth = scaledWidth + gutter
     * → xuất hiện thanh scroll ngang.
     */
    const canvasWidth =
      useMemo(
        () =>
          Math.max(
            viewportWidth,
            scaledWidth +
              PREVIEW_SIDE_GUTTER *
                2,
          ),
        [
          viewportWidth,
          scaledWidth,
        ],
      );

    const canvasHeight =
      useMemo(
        () =>
          scaledHeight +
          PREVIEW_TOP_GUTTER +
          PREVIEW_BOTTOM_GUTTER,
        [scaledHeight],
      );

    return (
      <div
        ref={rootRef}
        className="
          relative
          h-full
          w-full
          min-w-0
          overflow-hidden
          bg-[#e5e7eb]
        "
      >
        <div
          ref={scrollRef}
          onScroll={
            readScrollPosition
          }
          className="
            custom-scrollbar
            absolute
            inset-0
            overflow-auto
            overscroll-contain
          "
        >
          <div
            className="relative"
            style={{
              width:
                canvasWidth,

              minWidth:
                canvasWidth,

              height:
                canvasHeight,

              minHeight:
                canvasHeight,
            }}
          >
            <div
              className="
                absolute
                top-0
              "
              style={{
                left: '50%',

                width:
                  scaledWidth,

                height:
                  scaledHeight,

                marginTop:
                  PREVIEW_TOP_GUTTER,

                transform:
                  'translateX(-50%)',
              }}
            >
              <div
                ref={
                  naturalPreviewRef
                }
                className="
                  origin-top-left
                "
                style={{
                  width:
                    CV_PAGE_WIDTH,

                  transform:
                    `scale(${zoom})`,

                  /*
                   * Không animation khi pagination
                   * thay đổi để tránh chớp màn hình.
                   */
                  transition: 'none',
                }}
              >
                <PaginatedPreview />
              </div>
            </div>
          </div>
        </div>

        <div
          data-html2canvas-ignore="true"
          className="
            absolute
            bottom-5
            right-5
            z-50
            flex
            items-center
            gap-1
            rounded-full
            border
            border-[#d9d9e3]
            bg-white
            px-2
            py-1.5
            shadow-lg
          "
        >
          <button
            type="button"
            onClick={
              handleZoomOut
            }
            title="Thu nhỏ"
            aria-label="Thu nhỏ"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-lg
              text-[#6b7280]
              transition-colors
              hover:bg-[#f7f6fb]
              hover:text-[#111827]
            "
          >
            −
          </button>

          <button
            type="button"
            onClick={handleFit}
            title="Vừa màn hình"
            className="
              min-w-[62px]
              rounded-full
              px-2
              py-1.5
              text-xs
              font-medium
              text-[#374151]
              transition-colors
              hover:bg-[#f7f6fb]
            "
          >
            {Math.round(
              zoom * 100,
            )}
            %
          </button>

          <button
            type="button"
            onClick={
              handleZoomIn
            }
            title="Phóng to"
            aria-label="Phóng to"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-lg
              text-[#6b7280]
              transition-colors
              hover:bg-[#f7f6fb]
              hover:text-[#111827]
            "
          >
            +
          </button>
        </div>
      </div>
    );
  };

export default BuilderPreview;