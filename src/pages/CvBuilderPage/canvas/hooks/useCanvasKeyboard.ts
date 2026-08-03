import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { genId, type CanvasElement } from '../canvas.types';

const isEditingContext = (): boolean => {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    el.isContentEditable ||
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select'
  );
};

export const useCanvasKeyboard = () => {
  const clipboard = useRef<CanvasElement[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useCanvasStore.getState();
      const { selectedIds } = store;
      const editing = isEditingContext();
      const mod = e.ctrlKey || e.metaKey;

      // Undo / Redo (cho phép cả khi không chọn gì).
      if (mod && e.key.toLowerCase() === 'z') {
        if (editing) return;
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        if (editing) return;
        e.preventDefault();
        store.redo();
        return;
      }

      if (editing) return;

      // Xóa
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedIds.length > 0
      ) {
        e.preventDefault();
        store.removeElements(selectedIds);
        return;
      }

      // Nhân bản
      if (mod && e.key.toLowerCase() === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        store.duplicateElements(selectedIds);
        return;
      }

      // Copy
      if (mod && e.key.toLowerCase() === 'c' && selectedIds.length > 0) {
        clipboard.current = store.getSelectedElements().map((el) => ({
          ...el,
        }));
        return;
      }

      // Paste
      if (mod && e.key.toLowerCase() === 'v' && clipboard.current.length > 0) {
        e.preventDefault();
        const maxZ = store.getMaxZIndex(store.activePageId);
        const newIds: string[] = [];
        clipboard.current.forEach((el, i) => {
          const copy = {
            ...el,
            id: genId(el.type),
            x: el.x + 20,
            y: el.y + 20,
            zIndex: maxZ + 1 + i,
            groupId: undefined,
          } as CanvasElement;
          newIds.push(copy.id);
          store.addElement(store.activePageId, copy);
        });
        store.select(newIds);
        return;
      }

      // Nudge bằng phím mũi tên
      const nudge: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      if (nudge[e.key] && selectedIds.length > 0) {
        e.preventDefault();
        const [dx, dy] = nudge[e.key];
        const step = e.shiftKey ? 10 : 1;
        const elements = store.getSelectedElements();
        const patches: Record<string, Partial<CanvasElement>> = {};
        elements.forEach((el) => {
          patches[el.id] = { x: el.x + dx * step, y: el.y + dy * step };
        });
        store.updateElements(patches);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
