import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanvasStore } from '../store/useCanvasStore';
import { useAuth, useToast } from '../../../../context';
import {
  cvTemplateService,
  type CvTemplateResponse,
} from '../../../../services/cvTemplate.service';

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const MyCvsPanel = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const loadDocument = useCanvasStore((s) => s.loadDocument);
  const newDocument = useCanvasStore((s) => s.newDocument);
  const serverId = useCanvasStore((s) => s.serverId);

  const listQuery = useQuery({
    queryKey: ['cv-templates'],
    queryFn: cvTemplateService.list,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cvTemplateService.remove(id),
    onSuccess: (_res, id) => {
      void queryClient.invalidateQueries({ queryKey: ['cv-templates'] });
      if (serverId === id) newDocument();
      toast.success('Đã xóa CV.');
    },
    onError: () => toast.error('Xóa CV thất bại.'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      cvTemplateService.update(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cv-templates'] });
      toast.success('Đã đổi tên CV.');
    },
    onError: () => toast.error('Đổi tên thất bại.'),
  });

  const handleOpen = (tpl: CvTemplateResponse) => {
    if (tpl.canvas?.pages?.length) {
      loadDocument(tpl.canvas, tpl.id);
      toast.success(`Đã mở "${tpl.name}".`);
    } else {
      toast.error('CV này không có dữ liệu canvas.');
    }
  };

  const handleRename = (tpl: CvTemplateResponse) => {
    const name = window.prompt('Tên mới cho CV:', tpl.name);
    if (name && name.trim() && name.trim() !== tpl.name) {
      renameMutation.mutate({ id: tpl.id, name: name.trim() });
    }
  };

  const handleDelete = (tpl: CvTemplateResponse) => {
    if (window.confirm(`Xóa CV "${tpl.name}"? Không thể hoàn tác.`)) {
      deleteMutation.mutate(tpl.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <h2 className="text-sm font-bold text-[#111827]">CV của tôi</h2>
        <p className="mb-3 mt-2 text-sm text-[#6b7280]">
          Đăng nhập để lưu CV vào tài khoản và mở lại trên mọi thiết bị.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login?redirect=/cv-builder')}
          className="w-full rounded-md px-3 py-2 text-sm font-medium text-white"
          style={{ background: 'linear-gradient(to right, #f23b94, #ff6a21)' }}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111827]">CV của tôi</h2>
        <button
          type="button"
          onClick={() => newDocument()}
          className="rounded-md border border-[#e5e7eb] px-2 py-1 text-xs hover:border-[#f23b94]"
        >
          + CV mới
        </button>
      </div>

      {listQuery.isLoading && (
        <p className="text-sm text-[#6b7280]">Đang tải...</p>
      )}
      {listQuery.isError && (
        <p className="text-sm text-[#dc2626]">
          Không tải được danh sách. Kiểm tra kết nối máy chủ.
        </p>
      )}
      {listQuery.data && listQuery.data.length === 0 && (
        <p className="text-sm text-[#6b7280]">
          Chưa có CV nào. Thiết kế rồi bấm “Lưu CV” ở góc trên.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {listQuery.data?.map((tpl) => {
          const active = tpl.id === serverId;
          return (
            <li
              key={tpl.id}
              className={`rounded-md border p-2 ${
                active
                  ? 'border-[#f23b94] bg-[#fef3f8]'
                  : 'border-[#e5e7eb] bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => handleOpen(tpl)}
                className="block w-full truncate text-left text-sm font-semibold text-[#111827]"
                title={tpl.name}
              >
                {tpl.name}
                {active && (
                  <span className="ml-1 text-xs font-normal text-[#f23b94]">
                    (đang mở)
                  </span>
                )}
              </button>
              <p className="mt-0.5 text-xs text-[#9ca3af]">
                Cập nhật: {formatDate(tpl.updatedAt)}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpen(tpl)}
                  className="flex-1 rounded border border-[#e5e7eb] px-2 py-1 text-xs hover:border-[#f23b94]"
                >
                  Mở
                </button>
                <button
                  type="button"
                  onClick={() => handleRename(tpl)}
                  className="rounded border border-[#e5e7eb] px-2 py-1 text-xs hover:border-[#f23b94]"
                >
                  Đổi tên
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl)}
                  className="rounded border border-[#fecaca] px-2 py-1 text-xs text-[#dc2626] hover:bg-[#fef2f2]"
                >
                  Xóa
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
