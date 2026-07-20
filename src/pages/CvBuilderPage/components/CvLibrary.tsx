import { useState } from 'react';

interface SavedCv {
  id: string;
  name: string;
  updatedAt: string;
}

const MOCK_LIBRARY: SavedCv[] = [
  { id: 'cv-1', name: 'CV Frontend Developer', updatedAt: '18/07/2026' },
  { id: 'cv-2', name: 'CV Business Analyst', updatedAt: '10/07/2026' },
];

export const CvLibrary = () => {
  const [items] = useState<SavedCv[]>(MOCK_LIBRARY);

  return (
    <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
      <h3 className="mb-4 font-bold text-[#111827]">Thư viện CV</h3>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-md border border-[#d9d9e3] px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-[#111827]">{item.name}</p>
              <p className="text-xs text-[#6b7280]">Cập nhật: {item.updatedAt}</p>
            </div>
            <button className="text-xs font-medium text-[#f23b94] hover:underline">Mở</button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[#6b7280]">Bạn chưa lưu CV nào vào thư viện.</p>
      )}
    </div>
  );
};