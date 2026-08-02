import type {
  CvData,
} from './../../../../types/cv.types';

import type {
  SectionConfig,
  SectionKey,
} from './../../../../constants/TemplateCVsections';

import type {
  CvBlock,
} from './../../../../types/cvPagination.types';

const DESCRIPTION_CHUNK_LENGTH = 420;

const splitText = (
  text: string,
): string[] => {
  const normalized =
    text?.trim() ?? '';

  if (!normalized) {
    return [''];
  }

  const lines =
    normalized.split('\n');

  const chunks: string[] = [];

  let current = '';

  const flush = () => {
    if (current.trim()) {
      chunks.push(
        current.trim(),
      );
    }

    current = '';
  };

  lines.forEach(
    (line, lineIndex) => {
      const words =
        line
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      words.forEach((word) => {
        const candidate =
          current
            ? `${current} ${word}`
            : word;

        if (
          candidate.length >
            DESCRIPTION_CHUNK_LENGTH &&
          current
        ) {
          flush();
          current = word;
        } else {
          current = candidate;
        }
      });

      if (
        lineIndex <
        lines.length - 1
      ) {
        flush();
      }
    },
  );

  flush();

  return chunks.length
    ? chunks
    : [''];
};

const createDescriptionBlocks = ({
  kind,
  sectionKey,
  itemId,
  groupId,
  description,
}: {
  kind:
    | 'experience-description'
    | 'education-description'
    | 'activity-description'
    | 'certification-description'
    | 'award-description';

  sectionKey: SectionKey;
  itemId: string;
  groupId: string;
  description: string;
}): CvBlock[] => {
  const chunks =
    splitText(description);

  return chunks.map(
    (text, index) => ({
      id: `${kind}:${itemId}:${index}`,
      kind,
      sectionKey,
      itemId,
      groupId,
      text,
      chunkIndex: index,
      chunkCount:
        chunks.length,
      splittable: true,
    }),
  );
};

const sectionHasContent = (
  sectionKey: SectionKey,
  data: CvData,
): boolean => {
  switch (sectionKey) {
    case 'summary':
      return Boolean(
        data.summary,
      );

    case 'experience':
      return (
        data.experiences.length >
        0
      );

    case 'education':
      return (
        data.educations.length >
        0
      );

    case 'skills':
      return (
        data.skills.length > 0
      );

    case 'activities':
      return (
        data.activities.length >
        0
      );

    case 'certifications':
      return (
        data.certifications
          .length > 0
      );

    case 'awards':
      return (
        data.awards.length > 0
      );

    case 'references':
      return (
        data.references.length >
        0
      );

    case 'interests':
      return (
        data.interests.length >
        0
      );

    default:
      return false;
  }
};

const buildSectionBlocks = (
  sectionKey: SectionKey,
  data: CvData,
  editable: boolean,
): CvBlock[] => {
  const blocks: CvBlock[] = [
    {
      id: `section-title:${sectionKey}`,
      kind: 'section-title',
      sectionKey,
      keepWithNext: true,
    },
  ];

  switch (sectionKey) {
    case 'summary':
      blocks.push({
        id: 'summary:content',
        kind: 'summary',
        sectionKey,
        groupId: 'summary',
      });
      break;

    case 'experience':
      data.experiences.forEach(
        (item) => {
          const groupId =
            `experience:${item.id}`;

          blocks.push({
            id: `${groupId}:head`,
            kind: 'experience-head',
            sectionKey,
            itemId: item.id,
            groupId,
            keepWithNext: true,
          });

          blocks.push(
            ...createDescriptionBlocks(
              {
                kind:
                  'experience-description',
                sectionKey,
                itemId: item.id,
                groupId,
                description:
                  item.description,
              },
            ),
          );
        },
      );
      break;

    case 'education':
      data.educations.forEach(
        (item) => {
          const groupId =
            `education:${item.id}`;

          blocks.push({
            id: `${groupId}:head`,
            kind: 'education-head',
            sectionKey,
            itemId: item.id,
            groupId,
            keepWithNext: true,
          });

          blocks.push(
            ...createDescriptionBlocks(
              {
                kind:
                  'education-description',
                sectionKey,
                itemId: item.id,
                groupId,
                description:
                  item.description,
              },
            ),
          );
        },
      );
      break;

    case 'skills':
      data.skills.forEach(
        (item) => {
          blocks.push({
            id: `skill:${item.id}`,
            kind: 'skill',
            sectionKey,
            itemId: item.id,
            groupId:
              `skill:${item.id}`,
          });
        },
      );
      break;

    case 'activities':
      data.activities.forEach(
        (item) => {
          const groupId =
            `activity:${item.id}`;

          blocks.push({
            id: `${groupId}:head`,
            kind: 'activity-head',
            sectionKey,
            itemId: item.id,
            groupId,
            keepWithNext: true,
          });

          blocks.push(
            ...createDescriptionBlocks(
              {
                kind:
                  'activity-description',
                sectionKey,
                itemId: item.id,
                groupId,
                description:
                  item.description,
              },
            ),
          );
        },
      );
      break;

    case 'certifications':
      data.certifications.forEach(
        (item) => {
          const groupId =
            `certification:${item.id}`;

          blocks.push({
            id: `${groupId}:head`,
            kind:
              'certification-head',
            sectionKey,
            itemId: item.id,
            groupId,
            keepWithNext: true,
          });

          blocks.push(
            ...createDescriptionBlocks(
              {
                kind:
                  'certification-description',
                sectionKey,
                itemId: item.id,
                groupId,
                description:
                  item.description,
              },
            ),
          );
        },
      );
      break;

    case 'awards':
      data.awards.forEach(
        (item) => {
          const groupId =
            `award:${item.id}`;

          blocks.push({
            id: `${groupId}:head`,
            kind: 'award-head',
            sectionKey,
            itemId: item.id,
            groupId,
            keepWithNext: true,
          });

          blocks.push(
            ...createDescriptionBlocks(
              {
                kind:
                  'award-description',
                sectionKey,
                itemId: item.id,
                groupId,
                description:
                  item.description,
              },
            ),
          );
        },
      );
      break;

    case 'references':
      data.references.forEach(
        (item) => {
          blocks.push({
            id: `reference:${item.id}`,
            kind: 'reference',
            sectionKey,
            itemId: item.id,
            groupId:
              `reference:${item.id}`,
          });
        },
      );
      break;

    case 'interests':
      data.interests.forEach(
        (item) => {
          blocks.push({
            id: `interest:${item.id}`,
            kind: 'interest',
            sectionKey,
            itemId: item.id,
            groupId:
              `interest:${item.id}`,
          });
        },
      );
      break;
  }

  if (
    !sectionHasContent(
      sectionKey,
      data,
    ) &&
    editable
  ) {
    blocks.push({
      id: `empty:${sectionKey}`,
      kind: 'empty',
      sectionKey,
    });
  }

  if (
    editable &&
    sectionKey !== 'summary'
  ) {
    blocks.push({
      id: `add:${sectionKey}`,
      kind: 'add-button',
      sectionKey,
    });
  }

  return blocks;
};

export const buildCvBlocks = ({
  data,
  sections,
  editable,
}: {
  data: CvData;
  sections: SectionConfig[];
  editable: boolean;
}): CvBlock[] => {
  const blocks: CvBlock[] = [
    {
      id: 'cv-header',
      kind: 'header',
      groupId: 'cv-header',
    },
  ];

  sections
    .filter(
      (section) =>
        section.visible,
    )
    .forEach((section) => {
      blocks.push(
        ...buildSectionBlocks(
          section.key,
          data,
          editable,
        ),
      );
    });

  return blocks;
};