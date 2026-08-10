import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCvBuilderStore } from '../store/useCvBuilderStore';
import { exportCvToPdf } from '../../_utils/exportCvToPdf';

export const BuilderHeader = () => {
  const navigate = useNavigate();

  const cvName = useCvBuilderStore(
    (state) => state.cvName,
  );
  const setCvName = useCvBuilderStore(
    (state) => state.setCvName,
  );
  const past = useCvBuilderStore(
    (state) => state.past,
  );
  const future = useCvBuilderStore(
    (state) => state.future,
  );
  const undo = useCvBuilderStore(
    (state) => state.undo,
  );
  const redo = useCvBuilderStore(
    (state) => state.redo,
  );

  const [isExporting, setIsExporting] =
    useState(false);

  const handleSaveCv = () => {
    alert(
      'Tính năng lưu CV sẽ gọi API. Dữ liệu trong Store đã sẵn sàng!',
    );
  };

  const handleExportPdf = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      await exportCvToPdf(cvName);
    } catch (error) {
      console.error(error);
      alert('Không thể xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#d9d9e3] bg-[#ffffff] px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/cv-templates')}
          className="text-sm text-[#6b7280] hover:text-[#111827]"
        >
          ← Quay lại
        </button>

        <input
          value={cvName}
          onChange={(event) =>
            setCvName(event.target.value)
          }
          className="rounded-md border border-transparent px-2 py-1 font-bold text-[#111827] hover:border-[#d9d9e3] focus:border-[#f23b94] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={past.length === 0}
          title="Hoàn tác"
          className="rounded-md p-2 text-[#6b7280] hover:bg-[#f7f6fb] disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↺
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={future.length === 0}
          title="Làm lại"
          className="rounded-md p-2 text-[#6b7280] hover:bg-[#f7f6fb] disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↻
        </button>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="rounded-[8px] border border-[#f23b94] px-5 py-2 text-sm font-medium text-[#f23b94] transition-colors hover:bg-[#fef3f8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting
            ? 'Đang xuất...'
            : 'Xuất PDF'}
        </button>

        <button
          type="button"
          onClick={handleSaveCv}
          className="rounded-[8px] px-6 py-2 font-medium text-white shadow-md transition-all hover:opacity-90"
          style={{
            background:
              'linear-gradient(to right, #f23b94, #ff6a21)',
          }}
        >
          Lưu CV
        </button>
      </div>
    </header>
  );
};