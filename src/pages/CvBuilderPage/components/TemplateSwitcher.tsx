import { useNavigate } from 'react-router-dom';
import { useCvBuilderStore } from '../store/useCvBuilderStore';
import { CV_TEMPLATES } from '../../_components/cv-templates/TemplateRegistry';

export const TemplateSwitcher = () => {
  const navigate = useNavigate();
  const templateId = useCvBuilderStore((state) => state.templateId);
  const setTemplateId = useCvBuilderStore((state) => state.setTemplateId);

  const handleSwitch = (id: string) => {
    setTemplateId(id);
    navigate(`/cv-builder/${id}`, { replace: true });
  };

  return (
    <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
      <h3 className="mb-4 font-bold text-[#111827]">Đổi mẫu CV</h3>
      <p className="mb-4 text-xs text-[#6b7280]">Dữ liệu bạn đã nhập sẽ được giữ nguyên.</p>
      <div className="grid grid-cols-2 gap-3">
        {CV_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => handleSwitch(tpl.id)}
            className={`overflow-hidden rounded-md border text-left transition-all ${
              templateId === tpl.id ? 'border-[#f23b94] ring-1 ring-[#f23b94]' : 'border-[#d9d9e3]'
            }`}
          >
            <img src={tpl.thumbnail} alt={tpl.name} className="aspect-[3/4] w-full object-cover" />
            <p className="p-2 text-xs font-medium text-[#111827]">{tpl.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};