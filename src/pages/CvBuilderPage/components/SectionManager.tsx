import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCvBuilderStore } from '../store/useCvBuilderStore';
import { SortableSectionRow } from './dnd/SortableSectionRow';

export const SectionManager = () => {
  const sections = useCvBuilderStore((state) => state.sections);
  const settings = useCvBuilderStore((state) => state.settings);
  const toggleSection = useCvBuilderStore((state) => state.toggleSection);
  const reorderSections = useCvBuilderStore((state) => state.reorderSections);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderSections(active.id as any, over.id as any);
  };

  return (
    <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
      <h3 className="mb-4 font-bold text-[#111827]">Quản lý mục trong CV</h3>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {sections.map((section) => (
              <SortableSectionRow
                key={section.key}
                section={section}
                language={settings.language}
                onToggle={() => toggleSection(section.key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};