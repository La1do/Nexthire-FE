import type {
  ChangeEvent,
  KeyboardEvent,
} from 'react';

import type {
  CvTemplateProps,
} from './../../../../../types/cv.types';

interface ProfessionalHeaderProps {
  data: CvTemplateProps['data'];
  settings: CvTemplateProps['settings'];

  editable?: boolean;

  onUpdatePersonalInfo?: (
    info: Partial<
      CvTemplateProps['data']['personalInfo']
    >,
  ) => void;
}

interface EditableTextProps {
  value: string;
  placeholder: string;
  editable: boolean;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  onChange?: (value: string) => void;
}

const EditableText = ({
  value,
  placeholder,
  editable,
  className = '',
  style,
  multiline = false,
  onChange,
}: EditableTextProps) => {
  const handleBlur = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>,
  ) => {
    onChange?.(event.target.value);
  };

  const handleKeyDown = (
    event: KeyboardEvent<
      HTMLInputElement | HTMLTextAreaElement
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
    return (
      <span
        className={className}
        style={style}
      >
        {value || placeholder}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        defaultValue={value}
        placeholder={placeholder}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={1}
        data-html2canvas-ignore="false"
        className={`w-full resize-none border border-transparent bg-transparent p-0 outline-none transition-colors hover:border-dashed hover:border-[#9ca3af] focus:border-solid focus:border-[#f23b94] focus:bg-white ${className}`}
        style={style}
      />
    );
  }

  return (
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-html2canvas-ignore="false"
      className={`w-full min-w-0 border border-transparent bg-transparent p-0 outline-none transition-colors hover:border-dashed hover:border-[#9ca3af] focus:border-solid focus:border-[#f23b94] focus:bg-white ${className}`}
      style={style}
    />
  );
};

export const ProfessionalHeader = ({
  data,
  settings,
  editable = false,
  onUpdatePersonalInfo,
}: ProfessionalHeaderProps) => {
  const { personalInfo } = data;

  return (
    <header
      className="cv-header mb-6 flex items-center justify-between border-b-2 pb-6"
      style={{
        borderColor: settings.themeColor,
      }}
    >
      <div className="min-w-0 flex-1 pr-6">
        <EditableText
          value={personalInfo.fullName}
          placeholder="HỌ VÀ TÊN"
          editable={editable}
          onChange={(fullName) =>
            onUpdatePersonalInfo?.({
              fullName,
            })
          }
          className="block text-4xl font-bold uppercase tracking-wider text-[#111827]"
        />

        <EditableText
          value={personalInfo.jobTitle}
          placeholder="Vị trí ứng tuyển"
          editable={editable}
          onChange={(jobTitle) =>
            onUpdatePersonalInfo?.({
              jobTitle,
            })
          }
          className="mt-2 block text-xl font-medium"
          style={{
            color: settings.themeColor,
          }}
        />
      </div>

      <div className="flex w-[250px] shrink-0 flex-col gap-1 text-right text-sm text-[#374151]">
        <EditableText
          value={personalInfo.phone}
          placeholder="Số điện thoại"
          editable={editable}
          onChange={(phone) =>
            onUpdatePersonalInfo?.({
              phone,
            })
          }
          className="text-right"
        />

        <EditableText
          value={personalInfo.email}
          placeholder="Email"
          editable={editable}
          onChange={(email) =>
            onUpdatePersonalInfo?.({
              email,
            })
          }
          className="text-right"
        />

        <EditableText
          value={personalInfo.address}
          placeholder="Địa chỉ"
          editable={editable}
          onChange={(address) =>
            onUpdatePersonalInfo?.({
              address,
            })
          }
          className="text-right"
        />
      </div>
    </header>
  );
};

export default ProfessionalHeader;