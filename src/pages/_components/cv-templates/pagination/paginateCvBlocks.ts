import {
  CV_PAGE_CONTENT_HEIGHT,
} from './../../../../types/cvPagination.types';

import type {
  CvBlock,
  CvMeasuredBlock,
  CvPage,
  CvPaginationResult,
} from './../../../../types/cvPagination.types';

const EPSILON = 1;

const createPage = (
  index: number,
): CvPage => ({
  id: `cv-page-${index}`,
  index,
  blocks: [],
});

const createHeightMap = (
  measurements: CvMeasuredBlock[],
) =>
  new Map<string, number>(
    measurements.map(
      (measurement) => [
        measurement.id,
        Math.ceil(
          measurement.height,
        ),
      ],
    ),
  );

const sumHeight = (
  blocks: CvBlock[],
  heightMap: Map<
    string,
    number
  >,
) =>
  blocks.reduce(
    (total, block) =>
      total +
      (heightMap.get(block.id) ??
        0),
    0,
  );

const collectGroup = (
  blocks: CvBlock[],
  startIndex: number,
) => {
  const first =
    blocks[startIndex];

  if (!first.groupId) {
    return {
      blocks: [first],
      nextIndex:
        startIndex + 1,
    };
  }

  const result: CvBlock[] = [];

  let index = startIndex;

  while (
    index < blocks.length &&
    blocks[index].groupId ===
      first.groupId
  ) {
    result.push(blocks[index]);
    index += 1;
  }

  return {
    blocks: result,
    nextIndex: index,
  };
};

export const paginateCvBlocks = ({
  blocks,
  measurements,
  pageContentHeight = CV_PAGE_CONTENT_HEIGHT,
}: {
  blocks: CvBlock[];
  measurements: CvMeasuredBlock[];
  pageContentHeight?: number;
}): CvPaginationResult => {
  const heightMap =
    createHeightMap(
      measurements,
    );

  const unresolvedBlockIds =
    blocks
      .filter(
        (block) =>
          !heightMap.has(block.id),
      )
      .map(
        (block) => block.id,
      );

  if (
    unresolvedBlockIds.length >
    0
  ) {
    return {
      pages: [createPage(0)],
      unresolvedBlockIds,
    };
  }

  const pages: CvPage[] = [
    createPage(0),
  ];

  let currentPage = pages[0];
  let usedHeight = 0;
  let index = 0;

  const moveToNextPage = () => {
    currentPage = createPage(
      pages.length,
    );

    pages.push(currentPage);
    usedHeight = 0;
  };

  const addBlock = (
    block: CvBlock,
  ) => {
    currentPage.blocks.push(
      block,
    );

    usedHeight +=
      heightMap.get(block.id) ??
      0;
  };

  while (index < blocks.length) {
    const block = blocks[index];

    /*
     * Giữ title section cùng block đầu.
     */
    if (
      block.kind ===
        'section-title' &&
      index + 1 < blocks.length
    ) {
      const nextBlock =
        blocks[index + 1];

      const requiredHeight =
        (heightMap.get(block.id) ??
          0) +
        (heightMap.get(
          nextBlock.id,
        ) ?? 0);

      if (
        usedHeight > 0 &&
        usedHeight +
          requiredHeight >
          pageContentHeight +
            EPSILON
      ) {
        moveToNextPage();
      }

      addBlock(block);
      index += 1;
      continue;
    }

    const groupResult =
      collectGroup(
        blocks,
        index,
      );

    const groupBlocks =
      groupResult.blocks;

    const groupHeight =
      sumHeight(
        groupBlocks,
        heightMap,
      );

    /*
     * Item còn vừa một trang:
     * giữ nguyên toàn bộ.
     */
    if (
      groupBlocks.length > 1 &&
      groupHeight <=
        pageContentHeight +
          EPSILON
    ) {
      if (
        usedHeight > 0 &&
        usedHeight +
          groupHeight >
          pageContentHeight +
            EPSILON
      ) {
        moveToNextPage();
      }

      groupBlocks.forEach(
        addBlock,
      );

      index =
        groupResult.nextIndex;

      continue;
    }

    /*
     * Item cao hơn một trang:
     * giữ head cùng description đầu.
     */
    if (
      groupBlocks.length > 1 &&
      groupHeight >
        pageContentHeight +
          EPSILON
    ) {
      const head =
        groupBlocks[0];

      const descriptions =
        groupBlocks.slice(1);

      const firstDescription =
        descriptions[0];

      const firstPartHeight =
        (heightMap.get(head.id) ??
          0) +
        (firstDescription
          ? heightMap.get(
              firstDescription.id,
            ) ?? 0
          : 0);

      if (
        usedHeight > 0 &&
        usedHeight +
          firstPartHeight >
          pageContentHeight +
            EPSILON
      ) {
        moveToNextPage();
      }

      addBlock(head);

      if (firstDescription) {
        const firstDescriptionHeight =
          heightMap.get(
            firstDescription.id,
          ) ?? 0;

        if (
          usedHeight > 0 &&
          usedHeight +
            firstDescriptionHeight >
            pageContentHeight +
              EPSILON
        ) {
          moveToNextPage();
        }

        addBlock(
          firstDescription,
        );
      }

      descriptions
        .slice(1)
        .forEach(
          (descriptionBlock) => {
            const height =
              heightMap.get(
                descriptionBlock.id,
              ) ?? 0;

            if (
              usedHeight > 0 &&
              usedHeight +
                height >
                pageContentHeight +
                  EPSILON
            ) {
              moveToNextPage();
            }

            addBlock(
              descriptionBlock,
            );
          },
        );

      index =
        groupResult.nextIndex;

      continue;
    }

    const blockHeight =
      heightMap.get(block.id) ??
      0;

    if (
      usedHeight > 0 &&
      usedHeight +
        blockHeight >
        pageContentHeight +
          EPSILON
    ) {
      moveToNextPage();
    }

    addBlock(block);
    index += 1;
  }

  return {
    pages,
    unresolvedBlockIds: [],
  };
};