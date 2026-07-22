import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type {
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from 'react';

import {
  SECTION_LABELS,
} from './../../../../../constants/TemplateCVsections';

import type {
  SectionKey,
} from './../../../../../constants/TemplateCVsections';

import type {
  CvBlock,
  CvRenderMode,
  CvTemplateContext,
  CvTemplateMeasureProps,
  CvTemplatePageProps,
} from './../../../../../types/cvPagination.types';

import {
  ProfessionalHeader,
} from './ProfessionalHeader';

interface EditableTextProps {
  value?: string;
  placeholder?: string;
  editable: boolean;
  multiline?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;

  onChange?: (
    value: string,
  ) => void;
}

const createId = (
  prefix: string,
) => {
  const value =
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`;

  return `${prefix}-${value}`;
};

const EditableText = ({
  value = '',
  placeholder = '',
  editable,
  multiline = false,
  readOnly = false,
  className = '',
  style,
  onChange,
}: EditableTextProps) => {
  const [draft, setDraft] =
    useState(value);

  const textareaRef =
    useRef<HTMLTextAreaElement>(
      null,
    );

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useLayoutEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      'auto';

    textarea.style.height =
      `${Math.max(
        textarea.scrollHeight,
        20,
      )}px`;
  }, [draft]);

  const handleKeyDown = (
    event: KeyboardEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >,
  ) => {
    if (
      !multiline &&
      event.key === 'Enter'
    ) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  if (!editable) {
    if (multiline) {
      return (
        <p
          className={className}
          style={style}
        >
          {value}
        </p>
      );
    }

    return (
      <span
        className={className}
        style={style}
      >
        {value}
      </span>
    );
  }

  const fieldClassName = `
    block
    w-full
    min-w-0
    border
    border-transparent
    bg-transparent
    p-0
    outline-none
    hover:border-dashed
    hover:border-[#9ca3af]
    focus:border-[#f23b94]
    focus:bg-white
    ${className}
  `;

  const commit = () => {
    if (
      !readOnly &&
      draft !== value
    ) {
      onChange?.(draft);
    }
  };

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={1}
        onChange={(event) =>
          setDraft(
            event.target.value,
          )
        }
        onBlur={commit}
        onKeyDown={
          handleKeyDown
        }
        className={`
          ${fieldClassName}
          resize-none
          overflow-hidden
        `}
        style={style}
      />
    );
  }

  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(event) =>
        setDraft(
          event.target.value,
        )
      }
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={
        fieldClassName
      }
      style={style}
    />
  );
};

const RemoveButton = ({
  mode,
  onClick,
}: {
  mode: CvRenderMode;
  onClick?: () => void;
}) => {
  if (mode !== 'edit') {
    return null;
  }

  return (
    <button
      type="button"
      data-html2canvas-ignore="true"
      onClick={onClick}
      className="
        absolute
        -right-2
        -top-2
        z-20
        hidden
        h-6
        w-6
        items-center
        justify-center
        rounded-full
        bg-red-500
        text-xs
        font-bold
        text-white
        shadow
        group-hover:flex
      "
      aria-label="Xóa nội dung"
    >
      ×
    </button>
  );
};

const BlockWrapper = ({
  block,
  children,
}: {
  block: CvBlock;
  children: ReactNode;
}) => (
  <div
    data-cv-block-id={
      block.id
    }
    className="box-border"
  >
    {children}
  </div>
);

const getSectionLabel = (
  sectionKey: SectionKey,
  context: CvTemplateContext,
) =>
  SECTION_LABELS[
    sectionKey
  ][context.settings.language];

const getWrapperStyle = (
  context: CvTemplateContext,
): CSSProperties => {
  const fontSize =
    context.settings.fontSize ===
    'small'
      ? '13px'
      : context.settings
            .fontSize ===
          'large'
        ? '17px'
        : '15px';

  return {
    fontFamily:
      context.settings
        .fontFamily,
    fontSize,
    lineHeight:
      context.settings
        .lineHeight,
    color: '#374151',
  };
};

const renderAddButton = (
  block: CvBlock,
  context: CvTemplateContext,
) => {
  if (
    !block.sectionKey ||
    context.mode === 'export'
  ) {
    return null;
  }

  const handleAdd = () => {
    switch (
      block.sectionKey
    ) {
      case 'experience':
        context.actions
          .addExperience?.({
            id: createId('exp'),
            companyName: '',
            position: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
          });
        break;

      case 'education':
        context.actions
          .addEducation?.({
            id: createId('edu'),
            schoolName: '',
            major: '',
            startDate: '',
            endDate: '',
            description: '',
          });
        break;

      case 'skills':
        context.actions
          .addSkill?.({
            id: createId('skill'),
            name: '',
            level: '',
          });
        break;

      case 'activities':
        context.actions
          .addActivity?.({
            id: createId('activity'),
            name: '',
            role: '',
            startDate: '',
            endDate: '',
            description: '',
          });
        break;

      case 'certifications':
        context.actions
          .addCertification?.({
            id: createId('cert'),
            name: '',
            issuer: '',
            issueDate: '',
            description: '',
          });
        break;

      case 'awards':
        context.actions
          .addAward?.({
            id: createId('award'),
            name: '',
            issuer: '',
            date: '',
            description: '',
          });
        break;

      case 'references':
        context.actions
          .addReference?.({
            id: createId('reference'),
            name: '',
            position: '',
            company: '',
            phone: '',
            email: '',
          });
        break;

      case 'interests':
        context.actions
          .addInterest?.({
            id: createId('interest'),
            name: '',
          });
        break;
    }
  };

  return (
    <div className="pt-3 pb-6">
      <button
        type="button"
        data-html2canvas-ignore="true"
        disabled={
          context.mode ===
          'measure'
        }
        onClick={handleAdd}
        className="
          rounded-md
          border
          border-dashed
          border-[#f23b94]
          px-3
          py-1.5
          text-xs
          font-semibold
          text-[#f23b94]
        "
      >
        + Thêm{' '}
        {getSectionLabel(
          block.sectionKey,
          context,
        ).toLowerCase()}
      </button>
    </div>
  );
};

const renderBlock = (
  block: CvBlock,
  context: CvTemplateContext,
) => {
  const {
    data,
    settings,
    actions,
    mode,
  } = context;

  const editable =
    mode === 'edit' ||
    mode === 'measure';

  const readOnly =
    mode === 'measure';

  switch (block.kind) {
    case 'header':
      return (
        <ProfessionalHeader
          data={data}
          settings={settings}
          editable={editable}
          onUpdatePersonalInfo={
            mode === 'edit'
              ? actions.updatePersonalInfo
              : undefined
          }
        />
      );

    case 'section-title':
      if (!block.sectionKey) {
        return null;
      }

      return (
        <h3
          className="
            pb-4
            text-lg
            font-bold
            uppercase
          "
          style={{
            color:
              settings.themeColor,
          }}
        >
          {getSectionLabel(
            block.sectionKey,
            context,
          )}
        </h3>
      );

    case 'summary':
      return (
        <div className="pb-8">
          <EditableText
            value={data.summary}
            placeholder="Nhập mục tiêu nghề nghiệp"
            editable={editable}
            readOnly={readOnly}
            multiline
            onChange={
              actions.updateSummary
            }
            className="
              whitespace-pre-wrap
              text-justify
            "
          />
        </div>
      );

    case 'experience-head': {
      const item =
        data.experiences.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div
          className="
            group
            relative
            border-l-2
            border-[#d9d9e3]
            pb-2
            pl-4
          "
        >
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeExperience?.(
                item.id,
              )
            }
          />

          <div
            className="
              absolute
              -left-[5px]
              top-1.5
              h-2
              w-2
              rounded-full
            "
            style={{
              backgroundColor:
                settings.themeColor,
            }}
          />

          <EditableText
            value={item.position}
            placeholder="Vị trí"
            editable={editable}
            readOnly={readOnly}
            onChange={(position) =>
              actions.updateExperience?.(
                item.id,
                { position },
              )
            }
            className="
              font-bold
              text-[#111827]
            "
          />

          <EditableText
            value={
              item.companyName
            }
            placeholder="Tên công ty"
            editable={editable}
            readOnly={readOnly}
            onChange={(
              companyName,
            ) =>
              actions.updateExperience?.(
                item.id,
                { companyName },
              )
            }
            className="
              text-sm
              font-medium
            "
          />

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              italic
              text-[#6b7280]
            "
          >
            <EditableText
              value={
                item.startDate
              }
              placeholder="Bắt đầu"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                startDate,
              ) =>
                actions.updateExperience?.(
                  item.id,
                  { startDate },
                )
              }
            />

            <span>-</span>

            <EditableText
              value={
                item.isCurrent
                  ? 'Hiện tại'
                  : item.endDate
              }
              placeholder="Kết thúc"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                endDate,
              ) =>
                actions.updateExperience?.(
                  item.id,
                  {
                    endDate,
                    isCurrent:
                      false,
                  },
                )
              }
            />
          </div>
        </div>
      );
    }

    case 'experience-description':
      return (
        <div
          className="
            border-l-2
            border-[#d9d9e3]
            pb-5
            pl-4
          "
        >
          <p className="whitespace-pre-wrap text-sm">
            {block.text}
          </p>
        </div>
      );

    case 'education-head': {
      const item =
        data.educations.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative pb-2">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeEducation?.(
                item.id,
              )
            }
          />

          <EditableText
            value={item.major}
            placeholder="Chuyên ngành"
            editable={editable}
            readOnly={readOnly}
            onChange={(major) =>
              actions.updateEducation?.(
                item.id,
                { major },
              )
            }
            className="font-bold text-[#111827]"
          />

          <EditableText
            value={
              item.schoolName
            }
            placeholder="Tên trường"
            editable={editable}
            readOnly={readOnly}
            onChange={(
              schoolName,
            ) =>
              actions.updateEducation?.(
                item.id,
                { schoolName },
              )
            }
            className="text-sm font-medium"
          />

          <div className="flex gap-2 text-sm italic text-[#6b7280]">
            <EditableText
              value={
                item.startDate
              }
              placeholder="Bắt đầu"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                startDate,
              ) =>
                actions.updateEducation?.(
                  item.id,
                  { startDate },
                )
              }
            />

            <span>-</span>

            <EditableText
              value={
                item.endDate
              }
              placeholder="Kết thúc"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                endDate,
              ) =>
                actions.updateEducation?.(
                  item.id,
                  { endDate },
                )
              }
            />
          </div>
        </div>
      );
    }

    case 'education-description':
      return (
        <p className="whitespace-pre-wrap pb-4 text-sm">
          {block.text}
        </p>
      );

    case 'skill': {
      const item =
        data.skills.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative flex items-center gap-2 pb-2 text-sm">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeSkill?.(
                item.id,
              )
            }
          />

          <span>•</span>

          <EditableText
            value={item.name}
            placeholder="Tên kỹ năng"
            editable={editable}
            readOnly={readOnly}
            onChange={(name) =>
              actions.updateSkill?.(
                item.id,
                { name },
              )
            }
            className="font-medium"
          />

          <span>-</span>

          <EditableText
            value={item.level}
            placeholder="Mức độ"
            editable={editable}
            readOnly={readOnly}
            onChange={(level) =>
              actions.updateSkill?.(
                item.id,
                { level },
              )
            }
          />
        </div>
      );
    }

    case 'activity-head': {
      const item =
        data.activities.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative pb-2">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeActivity?.(
                item.id,
              )
            }
          />

          <EditableText
            value={item.name}
            placeholder="Tên hoạt động"
            editable={editable}
            readOnly={readOnly}
            onChange={(name) =>
              actions.updateActivity?.(
                item.id,
                { name },
              )
            }
            className="font-bold"
          />

          <EditableText
            value={item.role}
            placeholder="Vai trò"
            editable={editable}
            readOnly={readOnly}
            onChange={(role) =>
              actions.updateActivity?.(
                item.id,
                { role },
              )
            }
            className="text-sm font-medium"
          />

          <div className="flex gap-2 text-sm italic text-[#6b7280]">
            <EditableText
              value={
                item.startDate
              }
              placeholder="Bắt đầu"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                startDate,
              ) =>
                actions.updateActivity?.(
                  item.id,
                  { startDate },
                )
              }
            />

            <span>-</span>

            <EditableText
              value={
                item.endDate
              }
              placeholder="Kết thúc"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                endDate,
              ) =>
                actions.updateActivity?.(
                  item.id,
                  { endDate },
                )
              }
            />
          </div>
        </div>
      );
    }

    case 'activity-description':
      return (
        <p className="whitespace-pre-wrap pb-4 text-sm">
          {block.text}
        </p>
      );

    case 'certification-head': {
      const item =
        data.certifications.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative pb-2">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeCertification?.(
                item.id,
              )
            }
          />

          <EditableText
            value={item.name}
            placeholder="Tên chứng chỉ"
            editable={editable}
            readOnly={readOnly}
            onChange={(name) =>
              actions.updateCertification?.(
                item.id,
                { name },
              )
            }
            className="font-bold"
          />

          <div className="flex gap-2 text-sm">
            <EditableText
              value={item.issuer}
              placeholder="Đơn vị cấp"
              editable={editable}
              readOnly={readOnly}
              onChange={(issuer) =>
                actions.updateCertification?.(
                  item.id,
                  { issuer },
                )
              }
            />

            <span>·</span>

            <EditableText
              value={
                item.issueDate
              }
              placeholder="Ngày cấp"
              editable={editable}
              readOnly={readOnly}
              onChange={(
                issueDate,
              ) =>
                actions.updateCertification?.(
                  item.id,
                  { issueDate },
                )
              }
            />
          </div>
        </div>
      );
    }

    case 'certification-description':
      return (
        <p className="whitespace-pre-wrap pb-4 text-sm">
          {block.text}
        </p>
      );

    case 'award-head': {
      const item =
        data.awards.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative pb-2">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeAward?.(
                item.id,
              )
            }
          />

          <EditableText
            value={item.name}
            placeholder="Tên giải thưởng"
            editable={editable}
            readOnly={readOnly}
            onChange={(name) =>
              actions.updateAward?.(
                item.id,
                { name },
              )
            }
            className="font-bold"
          />

          <div className="flex gap-2 text-sm">
            <EditableText
              value={item.issuer}
              placeholder="Đơn vị cấp"
              editable={editable}
              readOnly={readOnly}
              onChange={(issuer) =>
                actions.updateAward?.(
                  item.id,
                  { issuer },
                )
              }
            />

            <span>·</span>

            <EditableText
              value={item.date}
              placeholder="Ngày nhận"
              editable={editable}
              readOnly={readOnly}
              onChange={(date) =>
                actions.updateAward?.(
                  item.id,
                  { date },
                )
              }
            />
          </div>
        </div>
      );
    }

    case 'award-description':
      return (
        <p className="whitespace-pre-wrap pb-4 text-sm">
          {block.text}
        </p>
      );

    case 'reference': {
      const item =
        data.references.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative pb-4">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeReference?.(
                item.id,
              )
            }
          />

          <EditableText
            value={item.name}
            placeholder="Họ và tên"
            editable={editable}
            readOnly={readOnly}
            onChange={(name) =>
              actions.updateReference?.(
                item.id,
                { name },
              )
            }
            className="font-bold"
          />

          <EditableText
            value={item.position}
            placeholder="Chức vụ"
            editable={editable}
            readOnly={readOnly}
            onChange={(position) =>
              actions.updateReference?.(
                item.id,
                { position },
              )
            }
            className="text-sm"
          />

          <EditableText
            value={item.company}
            placeholder="Công ty"
            editable={editable}
            readOnly={readOnly}
            onChange={(company) =>
              actions.updateReference?.(
                item.id,
                { company },
              )
            }
            className="text-sm"
          />

          <EditableText
            value={item.phone}
            placeholder="Số điện thoại"
            editable={editable}
            readOnly={readOnly}
            onChange={(phone) =>
              actions.updateReference?.(
                item.id,
                { phone },
              )
            }
            className="text-sm"
          />

          <EditableText
            value={item.email}
            placeholder="Email"
            editable={editable}
            readOnly={readOnly}
            onChange={(email) =>
              actions.updateReference?.(
                item.id,
                { email },
              )
            }
            className="text-sm"
          />
        </div>
      );
    }

    case 'interest': {
      const item =
        data.interests.find(
          (value) =>
            value.id ===
            block.itemId,
        );

      if (!item) {
        return null;
      }

      return (
        <div className="group relative inline-flex pb-2 pr-2">
          <RemoveButton
            mode={mode}
            onClick={() =>
              actions.removeInterest?.(
                item.id,
              )
            }
          />

          <div className="rounded-full border border-[#d9d9e3] px-3 py-1 text-sm">
            <EditableText
              value={item.name}
              placeholder="Sở thích"
              editable={editable}
              readOnly={readOnly}
              onChange={(name) =>
                actions.updateInterest?.(
                  item.id,
                  { name },
                )
              }
            />
          </div>
        </div>
      );
    }

    case 'empty':
      return (
        <p className="pb-3 text-sm italic text-[#9ca3af]">
          Chưa có nội dung.
        </p>
      );

    case 'add-button':
      return renderAddButton(
        block,
        context,
      );

    default:
      return null;
  }
};

export const ProfessionalPageRenderer =
  ({
    page,
    ...context
  }: CvTemplatePageProps) => (
    <div
      className="
        h-full
        w-full
        box-border
        overflow-hidden
        bg-white
        px-10
        py-10
      "
      style={getWrapperStyle(
        context,
      )}
    >
      {page.blocks.map(
        (block) => (
          <BlockWrapper
            key={block.id}
            block={block}
          >
            {renderBlock(
              block,
              context,
            )}
          </BlockWrapper>
        ),
      )}
    </div>
  );

export const ProfessionalMeasureRenderer =
  ({
    blocks,
    ...context
  }: CvTemplateMeasureProps) => (
    <div
      className="
        w-full
        box-border
        bg-white
        px-10
        py-10
      "
      style={getWrapperStyle(
        context,
      )}
    >
      {blocks.map((block) => (
        <BlockWrapper
          key={block.id}
          block={block}
        >
          {renderBlock(
            block,
            context,
          )}
        </BlockWrapper>
      ))}
    </div>
  );