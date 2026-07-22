import {
  useNavigate,
} from 'react-router-dom';

import type {
  CvTemplateCatalogItem,
} from './../../_components/cv-templates/TemplateCatalog';

interface TemplateCardProps {
  template: CvTemplateCatalogItem;
}

export const TemplateCard = ({
  template,
}: TemplateCardProps) => {
  const navigate =
    useNavigate();

  const handleUseTemplate =
    () => {
      navigate(
        `/cv-builder/${template.id}`,
      );
    };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-[#d9d9e3]
        bg-white
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div
        className="
          relative
          overflow-hidden
          bg-[#f3f4f6]
        "
      >
        <img
          src={template.thumbnail}
          alt={template.name}
          className="
            aspect-[3/4]
            w-full
            object-cover
            transition-transform
            duration-300
            group-hover:scale-[1.02]
          "
        />

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/0
            opacity-0
            transition-all
            group-hover:bg-black/30
            group-hover:opacity-100
          "
        >
          <button
            type="button"
            onClick={
              handleUseTemplate
            }
            className="
              rounded-lg
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-[#111827]
              shadow-lg
              transition-transform
              hover:scale-105
            "
          >
            Dùng mẫu này
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3
          className="
            mb-1
            text-base
            font-bold
            text-[#111827]
          "
        >
          {template.name}
        </h3>

        <p
          className="
            line-clamp-2
            text-sm
            text-[#6b7280]
          "
        >
          {template.description}
        </p>

        <button
          type="button"
          onClick={
            handleUseTemplate
          }
          className="
            mt-4
            w-full
            rounded-lg
            bg-[#f23b94]
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition-colors
            hover:bg-[#db2777]
          "
        >
          Tạo CV
        </button>
      </div>
    </article>
  );
};

export default TemplateCard;