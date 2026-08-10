import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanvasStore } from '../store/useCanvasStore';
import { exportCvToPdf } from '../../../_utils/exportCvToPdf';
import { useAuth, useToast } from '../../../../context';
import { cvTemplateService } from '../../../../services/cvTemplate.service';

export const CanvasHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const doc = useCanvasStore((s) => s.document);
  const setDocName = useCanvasStore((s) => s.setDocName);
  const past = useCanvasStore((s) => s.past);
  const future = useCanvasStore((s) => s.future);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const zoom = useCanvasStore((s) => s.zoom);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const addPage = useCanvasStore((s) => s.addPage);
  const serverId = useCanvasStore((s) => s.serverId);
  const setServerId = useCanvasStore((s) => s.setServerId);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      await exportCvToPdf(doc.name);
    } catch (error) {
      console.error(error);
      alert('Không thể xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const current = useCanvasStore.getState();
      const payload = { name: current.document.name, canvas: current.document };
      return current.serverId
        ? cvTemplateService.update(current.serverId, payload)
        : cvTemplateService.create(payload);
    },
    onSuccess: (tpl) => {
      setServerId(tpl.id);
      void queryClient.invalidateQueries({ queryKey: ['cv-templates'] });
      toast.success('Đã lưu CV vào tài khoản của bạn.');
    },
    onError: () => {
      toast.error('Lưu CV thất bại. Vui lòng thử lại.');
    },
  });

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu CV.');
      navigate('/login?redirect=/cv-builder');
      return;
    }
    saveMutation.mutate();
  };

  const iconBtn =
    'rounded-md p-2 text-[#6b7280] hover:bg-[#f7f6fb] disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <header className="z-10 flex shrink-0 flex-col gap-3 border-b border-[#d9d9e3] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/cv-templates')}
          className="shrink-0 text-sm whitespace-nowrap text-[#6b7280] hover:text-[#111827]"
        >
          ← Quay lại
        </button>
        <input
          value={doc.name}
          onChange={(e) => setDocName(e.target.value)}
          className="min-w-0 max-w-full rounded-md border border-transparent px-2 py-1 font-bold text-[#111827] hover:border-[#d9d9e3] focus:border-[#f23b94] focus:outline-none sm:max-w-[260px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          type="button"
          onClick={undo}
          disabled={past.length === 0}
          title="Hoàn tác (Ctrl+Z)"
          className={iconBtn}
        >
          ↺
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={future.length === 0}
          title="Làm lại (Ctrl+Y)"
          className={iconBtn}
        >
          ↻
        </button>

        <div className="mx-1 flex items-center gap-1 rounded-md border border-[#e5e7eb] px-1">
          <button type="button" onClick={zoomOut} className={iconBtn} title="Thu nhỏ">
            −
          </button>
          <span className="w-12 text-center text-sm text-[#6b7280]">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={zoomIn} className={iconBtn} title="Phóng to">
            +
          </button>
        </div>

        <button
          type="button"
          onClick={addPage}
          className="whitespace-nowrap rounded-md border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] hover:border-[#f23b94]"
        >
          + Thêm trang
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="whitespace-nowrap rounded-[8px] border border-[#f23b94] px-5 py-2 text-sm font-medium text-[#f23b94] transition-colors hover:bg-[#fef3f8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="whitespace-nowrap rounded-[8px] px-6 py-2 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: 'linear-gradient(to right, #f23b94, #ff6a21)' }}
        >
          {saveMutation.isPending
            ? 'Đang lưu...'
            : serverId
              ? 'Cập nhật'
              : 'Lưu CV'}
        </button>
      </div>
    </header>
  );
};
