import { useNavigate } from 'react-router-dom';
import type { CvTemplate } from './../../../types/cv.types';

interface TemplateCardProps {
  template: CvTemplate;
}

export const TemplateCard = ({ template }: TemplateCardProps) => {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/cv-builder/${template.id}`);
  };

  return (
    <div
      onClick={handleSelect}
      className="group cursor-pointer overflow-hidden rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-[#f7f6fb]">
        <img
          src={template.thumbnail}
          alt={template.name}
          className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
        />
      </div>

      <div className="flex items-center justify-between p-4">
        <span className="text-sm font-medium text-[#111827]">{template.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          className="rounded-[8px] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(to right, #f23b94, #ff6a21)' }}
        >
          Dùng mẫu này
        </button>
      </div>
    </div>
  );
};