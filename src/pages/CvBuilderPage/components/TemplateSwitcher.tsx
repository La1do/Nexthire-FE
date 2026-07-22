import {
  useNavigate,
} from 'react-router-dom';

import {
  useCvBuilderStore,
} from '../store/useCvBuilderStore';

import {
  CV_TEMPLATE_CATALOG,
} from './../../_components/cv-templates/TemplateCatalog';

export const TemplateSwitcher =
  () => {
    const navigate =
      useNavigate();

    const templateId =
      useCvBuilderStore(
        (state) =>
          state.templateId,
      );

    const setTemplateId =
      useCvBuilderStore(
        (state) =>
          state.setTemplateId,
      );

    const handleSwitch = (
      id: string,
    ) => {
      if (id === templateId) {
        return;
      }

      setTemplateId(id);

      navigate(
        `/cv-builder/${id}`,
        {
          replace: true,
        },
      );
    };

    return (
      <div
        className="
          rounded-[8px]
          border
          border-[#d9d9e3]
          bg-white
          p-4
          shadow-sm
        "
      >
        <h3
          className="
            mb-2
            font-bold
            text-[#111827]
          "
        >
          Đổi mẫu CV
        </h3>

        <p
          className="
            mb-4
            text-xs
            text-[#6b7280]
          "
        >
          Dữ liệu bạn đã nhập sẽ được giữ nguyên.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {CV_TEMPLATE_CATALOG.map(
            (template) => {
              const isActive =
                templateId ===
                template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() =>
                    handleSwitch(
                      template.id,
                    )
                  }
                  aria-pressed={
                    isActive
                  }
                  className={`
                    overflow-hidden
                    rounded-md
                    border
                    bg-white
                    text-left
                    transition-all
                    ${
                      isActive
                        ? `
                          border-[#f23b94]
                          ring-1
                          ring-[#f23b94]
                        `
                        : `
                          border-[#d9d9e3]
                          hover:border-[#9ca3af]
                        `
                    }
                  `}
                >
                  <img
                    src={
                      template.thumbnail
                    }
                    alt={
                      template.name
                    }
                    className="
                      aspect-[3/4]
                      w-full
                      bg-[#f7f6fb]
                      object-cover
                    "
                  />

                  <div className="p-2">
                    <p
                      className="
                        truncate
                        text-xs
                        font-medium
                        text-[#111827]
                      "
                    >
                      {template.name}
                    </p>
                  </div>
                </button>
              );
            },
          )}
        </div>

        {CV_TEMPLATE_CATALOG.length ===
          0 && (
          <p
            className="
              py-4
              text-center
              text-xs
              text-[#6b7280]
            "
          >
            Chưa có mẫu CV.
          </p>
        )}
      </div>
    );
  };

export default TemplateSwitcher;