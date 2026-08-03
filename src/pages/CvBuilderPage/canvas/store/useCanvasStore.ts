import { create } from 'zustand';
import {
  createEmptyDocument,
  createPage,
  genId,
  type CanvasDocument,
  type CanvasElement,
  type CanvasPage,
} from '../canvas.types';

const STORAGE_KEY = 'nexthire-cv-canvas';
const MAX_HISTORY = 30;

// ---- localStorage persistence -----------------------------------------

const loadDocument = (): CanvasDocument => {
  if (typeof window === 'undefined') return createEmptyDocument();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyDocument();
    const parsed = JSON.parse(raw) as CanvasDocument;
    if (!parsed?.pages?.length) return createEmptyDocument();
    return parsed;
  } catch {
    return createEmptyDocument();
  }
};

const persist = (doc: CanvasDocument) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    /* quota / private mode — bỏ qua */
  }
};

// Lưu id bản ghi BE để sau khi refresh vẫn biết "Cập nhật" thay vì tạo mới.
const SERVER_ID_KEY = 'nexthire-cv-canvas-server-id';

const loadServerId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(SERVER_ID_KEY) || null;
  } catch {
    return null;
  }
};

const persistServerId = (id: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (id) window.localStorage.setItem(SERVER_ID_KEY, id);
    else window.localStorage.removeItem(SERVER_ID_KEY);
  } catch {
    /* bỏ qua */
  }
};

// ---- helpers -----------------------------------------------------------

const clone = <T,>(v: T): T =>
  typeof structuredClone === 'function'
    ? structuredClone(v)
    : (JSON.parse(JSON.stringify(v)) as T);

interface CanvasState {
  document: CanvasDocument;
  activePageId: string;
  selectedIds: string[];
  zoom: number;
  past: CanvasDocument[];
  future: CanvasDocument[];
  // id bản ghi trên BE của CV đang mở (null = chưa lưu lần nào)
  serverId: string | null;

  // meta
  setDocName: (name: string) => void;
  setActivePage: (pageId: string) => void;
  setServerId: (id: string | null) => void;
  loadDocument: (doc: CanvasDocument, serverId: string | null) => void;
  newDocument: () => void;

  // selection
  select: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;

  // transaction (kéo/resize/rotate live — không spam history)
  beginHistory: () => void;
  setLive: (patches: Record<string, Partial<CanvasElement>>) => void;
  endHistory: () => void;

  // element CRUD
  addElement: (pageId: string, element: CanvasElement) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  updateElements: (patches: Record<string, Partial<CanvasElement>>) => void;
  removeElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;

  // z-order
  bringForward: (ids: string[]) => void;
  sendBackward: (ids: string[]) => void;
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;

  // lock / visibility
  toggleLock: (ids: string[]) => void;
  toggleHidden: (ids: string[]) => void;

  // group
  groupSelected: () => void;
  ungroupSelected: () => void;

  // templates
  applyTemplate: (pages: CanvasPage[], name?: string) => void;

  // pages
  addPage: () => void;
  removePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  setPageBackground: (pageId: string, background: string) => void;

  // zoom
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;

  // history
  undo: () => void;
  redo: () => void;

  // derived
  getSelectedElements: () => CanvasElement[];
  getMaxZIndex: (pageId: string) => number;
}

const initialDoc = loadDocument();

export const useCanvasStore = create<CanvasState>((set, get) => {
  // Ghi lại snapshot document hiện tại vào past trước 1 thay đổi, rồi persist.
  const commit = (
    mutate: (doc: CanvasDocument) => CanvasDocument,
    extra?: Partial<CanvasState>,
  ) => {
    resetCoalesce();
    set((state) => {
      const nextDoc = mutate(clone(state.document));
      persist(nextDoc);
      return {
        past: [...state.past, state.document].slice(-MAX_HISTORY),
        future: [],
        document: nextDoc,
        ...extra,
      };
    });
  };

  // Gộp lịch sử: các chỉnh sửa liên tiếp cùng "key" (vd đổi màu 1 element) trong
  // khoảng thời gian ngắn chỉ tạo 1 bước undo, thay vì mỗi onChange 1 bước.
  const COALESCE_MS = 800;
  let coalesceKey = '';
  let coalesceTime = 0;

  const resetCoalesce = () => {
    coalesceKey = '';
    coalesceTime = 0;
  };

  const commitField = (
    key: string,
    mutate: (doc: CanvasDocument) => CanvasDocument,
  ) =>
    set((state) => {
      const now = Date.now();
      const mergeable =
        key !== '' && coalesceKey === key && now - coalesceTime < COALESCE_MS;
      coalesceKey = key;
      coalesceTime = now;
      const nextDoc = mutate(clone(state.document));
      persist(nextDoc);
      if (mergeable) {
        // Cùng phiên chỉnh sửa → cập nhật document, KHÔNG đẩy snapshot mới.
        return { document: nextDoc, future: [] };
      }
      return {
        past: [...state.past, state.document].slice(-MAX_HISTORY),
        future: [],
        document: nextDoc,
      };
    });

  return {
    document: initialDoc,
    activePageId: initialDoc.pages[0].id,
    selectedIds: [],
    zoom: 0.85,
    past: [],
    future: [],
    serverId: loadServerId(),

    setDocName: (name) =>
      commitField('docName', (doc) => ({ ...doc, name })),

    setActivePage: (pageId) =>
      set({ activePageId: pageId, selectedIds: [] }),

    setServerId: (id) => {
      persistServerId(id);
      set({ serverId: id });
    },

    loadDocument: (doc, serverId) => {
      persist(doc);
      persistServerId(serverId);
      set({
        document: doc,
        serverId,
        activePageId: doc.pages[0]?.id ?? '',
        selectedIds: [],
        past: [],
        future: [],
      });
    },

    newDocument: () => {
      const doc = createEmptyDocument();
      persist(doc);
      persistServerId(null);
      set({
        document: doc,
        serverId: null,
        activePageId: doc.pages[0].id,
        selectedIds: [],
        past: [],
        future: [],
      });
    },

    select: (ids) => {
      resetCoalesce();
      set({ selectedIds: ids });
    },
    addToSelection: (id) =>
      set((s) =>
        s.selectedIds.includes(id)
          ? s
          : { selectedIds: [...s.selectedIds, id] },
      ),
    toggleSelection: (id) =>
      set((s) => ({
        selectedIds: s.selectedIds.includes(id)
          ? s.selectedIds.filter((x) => x !== id)
          : [...s.selectedIds, id],
      })),
    clearSelection: () => set({ selectedIds: [] }),

    beginHistory: () =>
      set((state) => ({
        past: [...state.past, state.document].slice(-MAX_HISTORY),
        future: [],
      })),

    setLive: (patches) =>
      set((state) => ({
        document: {
          ...state.document,
          pages: state.document.pages.map((p) => ({
            ...p,
            elements: p.elements.map((e) =>
              patches[e.id]
                ? ({ ...e, ...patches[e.id] } as CanvasElement)
                : e,
            ),
          })),
        },
      })),

    endHistory: () => persist(get().document),

    addElement: (pageId, element) =>
      commit(
        (doc) => ({
          ...doc,
          pages: doc.pages.map((p) =>
            p.id === pageId
              ? { ...p, elements: [...p.elements, element] }
              : p,
          ),
        }),
        { selectedIds: [element.id], activePageId: pageId },
      ),

    updateElement: (id, patch) =>
      commitField(
        `el:${id}:${Object.keys(patch).sort().join(',')}`,
        (doc) => ({
          ...doc,
          pages: doc.pages.map((p) => ({
            ...p,
            elements: p.elements.map((e) =>
              e.id === id ? ({ ...e, ...patch } as CanvasElement) : e,
            ),
          })),
        }),
      ),

    updateElements: (patches) =>
      commit((doc) => ({
        ...doc,
        pages: doc.pages.map((p) => ({
          ...p,
          elements: p.elements.map((e) =>
            patches[e.id]
              ? ({ ...e, ...patches[e.id] } as CanvasElement)
              : e,
          ),
        })),
      })),

    removeElements: (ids) =>
      commit(
        (doc) => ({
          ...doc,
          pages: doc.pages.map((p) => ({
            ...p,
            elements: p.elements.filter((e) => !ids.includes(e.id)),
          })),
        }),
        { selectedIds: [] },
      ),

    duplicateElements: (ids) => {
      const state = get();
      const page = state.document.pages.find((p) =>
        p.elements.some((e) => ids.includes(e.id)),
      );
      if (!page) return;
      const maxZ = state.getMaxZIndex(page.id);
      const newIds: string[] = [];
      commit(
        (doc) => ({
          ...doc,
          pages: doc.pages.map((p) => {
            if (p.id !== page.id) return p;
            const clones = p.elements
              .filter((e) => ids.includes(e.id))
              .map((e, i) => {
                const copy = {
                  ...clone(e),
                  id: genId(e.type),
                  x: e.x + 16,
                  y: e.y + 16,
                  zIndex: maxZ + 1 + i,
                  groupId: undefined,
                } as CanvasElement;
                newIds.push(copy.id);
                return copy;
              });
            return { ...p, elements: [...p.elements, ...clones] };
          }),
        }),
        { selectedIds: newIds },
      );
    },

    bringForward: (ids) => reorderZ(commit, ids, 'forward'),
    sendBackward: (ids) => reorderZ(commit, ids, 'backward'),
    bringToFront: (ids) => reorderZ(commit, ids, 'front'),
    sendToBack: (ids) => reorderZ(commit, ids, 'back'),

    toggleLock: (ids) =>
      commit((doc) => ({
        ...doc,
        pages: doc.pages.map((p) => ({
          ...p,
          elements: p.elements.map((e) =>
            ids.includes(e.id) ? { ...e, locked: !e.locked } : e,
          ),
        })),
      })),

    toggleHidden: (ids) =>
      commit((doc) => ({
        ...doc,
        pages: doc.pages.map((p) => ({
          ...p,
          elements: p.elements.map((e) =>
            ids.includes(e.id) ? { ...e, hidden: !e.hidden } : e,
          ),
        })),
      })),

    groupSelected: () => {
      const { selectedIds } = get();
      if (selectedIds.length < 2) return;
      const groupId = genId('group');
      commit((doc) => ({
        ...doc,
        pages: doc.pages.map((p) => ({
          ...p,
          elements: p.elements.map((e) =>
            selectedIds.includes(e.id) ? { ...e, groupId } : e,
          ),
        })),
      }));
    },

    ungroupSelected: () => {
      const { selectedIds } = get();
      commit((doc) => ({
        ...doc,
        pages: doc.pages.map((p) => ({
          ...p,
          elements: p.elements.map((e) =>
            selectedIds.includes(e.id) ? { ...e, groupId: undefined } : e,
          ),
        })),
      }));
    },

    applyTemplate: (pages, name) => {
      if (pages.length === 0) return;
      commit(
        (doc) => ({
          ...doc,
          name: name ?? doc.name,
          pages,
        }),
        { activePageId: pages[0].id, selectedIds: [] },
      );
    },

    addPage: () => {
      const page = createPage();
      commit(
        (doc) => ({ ...doc, pages: [...doc.pages, page] }),
        { activePageId: page.id, selectedIds: [] },
      );
    },

    removePage: (pageId) => {
      const state = get();
      if (state.document.pages.length <= 1) return;
      const remaining = state.document.pages.filter((p) => p.id !== pageId);
      commit(
        (doc) => ({
          ...doc,
          pages: doc.pages.filter((p) => p.id !== pageId),
        }),
        {
          activePageId:
            state.activePageId === pageId
              ? remaining[0].id
              : state.activePageId,
          selectedIds: [],
        },
      );
    },

    duplicatePage: (pageId) => {
      const page = get().document.pages.find((p) => p.id === pageId);
      if (!page) return;
      const newPage: CanvasPage = {
        ...clone(page),
        id: genId('page'),
        elements: page.elements.map((e) => ({
          ...clone(e),
          id: genId(e.type),
        })),
      };
      commit(
        (doc) => {
          const idx = doc.pages.findIndex((p) => p.id === pageId);
          const pages = [...doc.pages];
          pages.splice(idx + 1, 0, newPage);
          return { ...doc, pages };
        },
        { activePageId: newPage.id, selectedIds: [] },
      );
    },

    setPageBackground: (pageId, background) =>
      commitField(`bg:${pageId}`, (doc) => ({
        ...doc,
        pages: doc.pages.map((p) =>
          p.id === pageId ? { ...p, background } : p,
        ),
      })),

    setZoom: (zoom) =>
      set({ zoom: Math.min(2, Math.max(0.25, +zoom.toFixed(2))) }),
    zoomIn: () =>
      set((s) => ({ zoom: Math.min(2, +(s.zoom + 0.1).toFixed(2)) })),
    zoomOut: () =>
      set((s) => ({ zoom: Math.max(0.25, +(s.zoom - 0.1).toFixed(2)) })),

    undo: () => {
      resetCoalesce();
      const state = get();
      if (state.past.length === 0) return;
      const previous = state.past[state.past.length - 1];
      persist(previous);
      set({
        past: state.past.slice(0, -1),
        future: [state.document, ...state.future].slice(0, MAX_HISTORY),
        document: previous,
        selectedIds: [],
        activePageId: previous.pages.some((p) => p.id === state.activePageId)
          ? state.activePageId
          : previous.pages[0].id,
      });
    },

    redo: () => {
      resetCoalesce();
      const state = get();
      if (state.future.length === 0) return;
      const next = state.future[0];
      persist(next);
      set({
        past: [...state.past, state.document].slice(-MAX_HISTORY),
        future: state.future.slice(1),
        document: next,
        selectedIds: [],
        activePageId: next.pages.some((p) => p.id === state.activePageId)
          ? state.activePageId
          : next.pages[0].id,
      });
    },

    getSelectedElements: () => {
      const { document: doc, selectedIds } = get();
      const all = doc.pages.flatMap((p) => p.elements);
      return all.filter((e) => selectedIds.includes(e.id));
    },

    getMaxZIndex: (pageId) => {
      const page = get().document.pages.find((p) => p.id === pageId);
      if (!page || page.elements.length === 0) return 0;
      return Math.max(...page.elements.map((e) => e.zIndex));
    },
  };

  // ---- z-order helper (đóng gói để dùng lại) --------------------------
  function reorderZ(
    commitFn: typeof commit,
    ids: string[],
    dir: 'forward' | 'backward' | 'front' | 'back',
  ) {
    if (ids.length === 0) return;
    commitFn((doc) => ({
      ...doc,
      pages: doc.pages.map((p) => {
        if (!p.elements.some((e) => ids.includes(e.id))) return p;
        // Sắp theo zIndex hiện tại rồi gán lại chỉ số liên tục.
        const sorted = [...p.elements].sort((a, b) => a.zIndex - b.zIndex);
        const order = sorted.map((e) => e.id);

        const moveWithin = (arr: string[]) => {
          const selected = arr.filter((id) => ids.includes(id));
          const rest = arr.filter((id) => !ids.includes(id));
          if (dir === 'front') return [...rest, ...selected];
          if (dir === 'back') return [...selected, ...rest];
          // forward/backward: dịch từng bước
          const result = [...arr];
          const indices = arr
            .map((id, i) => ({ id, i }))
            .filter((x) => ids.includes(x.id))
            .map((x) => x.i);
          if (dir === 'forward') {
            for (let k = indices.length - 1; k >= 0; k -= 1) {
              const i = indices[k];
              if (i < result.length - 1 && !ids.includes(result[i + 1])) {
                [result[i], result[i + 1]] = [result[i + 1], result[i]];
              }
            }
          } else {
            for (let k = 0; k < indices.length; k += 1) {
              const i = indices[k];
              if (i > 0 && !ids.includes(result[i - 1])) {
                [result[i], result[i - 1]] = [result[i - 1], result[i]];
              }
            }
          }
          return result;
        };

        const newOrder = moveWithin(order);
        const zById = new Map(newOrder.map((id, i) => [id, i]));
        return {
          ...p,
          elements: p.elements.map((e) => ({
            ...e,
            zIndex: zById.get(e.id) ?? e.zIndex,
          })),
        };
      }),
    }));
  }
});
