import { useCvBuilderStore } from '../store/useCvBuilderStore';
import { PaginatedPreview } from './preview/PaginatedPreview';

export const BuilderPreview = () => {
  const zoom = useCvBuilderStore((state) => state.zoom);
  const zoomIn = useCvBuilderStore((state) => state.zoomIn);
  const zoomOut = useCvBuilderStore((state) => state.zoomOut);

  return (
    <div className="relative h-full w-full overflow-auto bg-[#e5e7eb] p-8">
      <div className="origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
        <PaginatedPreview />
      </div>

      <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-[#d9d9e3] bg-[#ffffff] px-3 py-1.5 shadow-md">
        <button onClick={zoomOut} className="px-2 text-[#6b7280] hover:text-[#111827]">−</button>
        <span className="w-10 text-center text-xs text-[#374151]">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} className="px-2 text-[#6b7280] hover:text-[#111827]">+</button>
      </div>
    </div>
  );
};