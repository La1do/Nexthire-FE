import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionConfig } from '../../../../constants/TemplateCVsections';
import { SECTION_LABELS } from '../../../../constants/TemplateCVsections';
import type { CvLanguage } from '../../../../constants/TemplateCVsections';

interface SortableSectionRowProps {
  section: SectionConfig;
  language: CvLanguage;
  onToggle: () => void;
}

export const SortableSectionRow = ({ section, language, onToggle }: SortableSectionRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-md border border-[#d9d9e3] bg-white px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[#9ca3af] hover:text-[#111827] active:cursor-grabbing"
          title="Kéo để sắp xếp"
        >
          ⠿
        </button>
        <span className={`text-sm ${section.visible ? 'text-[#111827]' : 'text-[#6b7280]'}`}>
          {SECTION_LABELS[section.key][language]}
        </span>
      </div>

      <button
        onClick={onToggle}
        className={`h-5 w-9 rounded-full transition-colors ${
          section.visible ? 'bg-[#f23b94]' : 'bg-[#d9d9e3]'
        }`}
      >
        <span
          className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
            section.visible ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};