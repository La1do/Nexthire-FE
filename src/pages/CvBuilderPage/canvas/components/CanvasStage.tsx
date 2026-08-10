import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import { useCanvasStore } from '../store/useCanvasStore';
import { CanvasPageView } from './CanvasPageView';
import type { CanvasElement } from '../canvas.types';

const GAP = 32;

export const CanvasStage = () => {
  const doc = useCanvasStore((s) => s.document);
  const zoom = useCanvasStore((s) => s.zoom);
  const activePageId = useCanvasStore((s) => s.activePageId);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const select = useCanvasStore((s) => s.select);
  const setActivePage = useCanvasStore((s) => s.setActivePage);
  const updateElements = useCanvasStore((s) => s.updateElements);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [targets, setTargets] = useState<HTMLElement[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const startRef = useRef<Map<string, CanvasElement>>(new Map());
  // Patch tích lũy trong lúc thao tác — chỉ ghi vào store 1 lần khi thả.
  const pendingRef = useRef<Record<string, Partial<CanvasElement>>>({});

  const { width: pageW, height: pageH } = doc.pageSize;

  const activePage = useMemo(
    () => doc.pages.find((p) => p.id === activePageId) ?? doc.pages[0],
    [doc.pages, activePageId],
  );

  const elementById = useMemo(() => {
    const map = new Map<string, CanvasElement>();
    doc.pages.forEach((p) => p.elements.forEach((e) => map.set(e.id, e)));
    return map;
  }, [doc]);

  // Cập nhật danh sách DOM target cho Moveable theo selection (bỏ element khóa).
  useEffect(() => {
    if (!stageRef.current || editingId) {
      setTargets([]);
      return;
    }
    const nodes = selectedIds
      .filter((id) => !elementById.get(id)?.locked)
      .map((id) =>
        stageRef.current!.querySelector<HTMLElement>(
          `[data-element-id="${id}"]`,
        ),
      )
      .filter((n): n is HTMLElement => n !== null);
    setTargets(nodes);
  }, [selectedIds, editingId, elementById]);

  // Guidelines: tất cả element khác trên trang active (để snap).
  const elementGuidelines = useMemo(
    () =>
      activePage.elements
        .filter((e) => !selectedIds.includes(e.id) && !e.hidden)
        .map((e) => `[data-element-id="${e.id}"]`),
    [activePage, selectedIds],
  );

  const snapshotStart = useCallback((ids: string[]) => {
    const map = new Map<string, CanvasElement>();
    ids.forEach((id) => {
      const el = useCanvasStore.getState().document.pages
        .flatMap((p) => p.elements)
        .find((e) => e.id === id);
      if (el) map.set(id, { ...el });
    });
    startRef.current = map;
  }, []);

  const idOf = (t: HTMLElement | SVGElement) =>
    (t as HTMLElement).dataset.elementId ?? '';

  // Ghi trực tiếp style vào DOM (không đụng React) để kéo/resize mượt.
  const applyDom = (
    node: HTMLElement,
    patch: Partial<CanvasElement>,
  ) => {
    if (patch.x != null) node.style.left = `${patch.x}px`;
    if (patch.y != null) node.style.top = `${patch.y}px`;
    if (patch.width != null) node.style.width = `${patch.width}px`;
    if (patch.height != null) node.style.height = `${patch.height}px`;
    if (patch.rotation != null)
      node.style.transform = `rotate(${patch.rotation}deg)`;
  };

  const stageLive = (
    target: HTMLElement | SVGElement,
    patch: Partial<CanvasElement>,
  ) => {
    const id = idOf(target);
    if (!id) return;
    pendingRef.current[id] = { ...pendingRef.current[id], ...patch };
    applyDom(target as HTMLElement, patch);
  };

  const beginGesture = (ids: string[]) => {
    pendingRef.current = {};
    snapshotStart(ids);
  };

  const commitGesture = () => {
    const patches = pendingRef.current;
    pendingRef.current = {};
    if (Object.keys(patches).length > 0) updateElements(patches);
  };

  const totalHeight = doc.pages.length * pageH + (doc.pages.length - 1) * GAP;

  return (
    <div
      className="custom-scrollbar"
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        overflow: 'auto',
        background: '#e9e8ef',
        padding: 40,
      }}
      onMouseDown={(e) => {
        // Click nền → bỏ chọn.
        if (e.target === e.currentTarget) {
          select([]);
          setEditingId(null);
        }
      }}
    >
      <div
        style={{
          width: pageW * zoom,
          height: totalHeight * zoom,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          ref={stageRef}
          style={{
            width: pageW,
            height: totalHeight,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: GAP,
          }}
        >
          {doc.pages.map((page) => (
            <CanvasPageView
              key={page.id}
              page={page}
              pageWidth={pageW}
              pageHeight={pageH}
              isActive={page.id === activePageId}
              selectedIds={selectedIds}
              editingId={editingId}
              onStartEdit={(id) => {
                setEditingId(id);
                select([id]);
              }}
              onStopEdit={() => setEditingId(null)}
              onActivate={() => {
                if (page.id !== activePageId) setActivePage(page.id);
              }}
            />
          ))}

          {!editingId && (
            <Moveable
              ref={moveableRef}
              target={targets}
              draggable
              resizable
              rotatable
              snappable
              origin={false}
              throttleDrag={0}
              throttleResize={0}
              throttleRotate={0}
              snapThreshold={5}
              elementGuidelines={elementGuidelines}
              snapDirections={{
                top: true,
                left: true,
                bottom: true,
                right: true,
                center: true,
                middle: true,
              }}
              elementSnapDirections={{
                top: true,
                left: true,
                bottom: true,
                right: true,
                center: true,
                middle: true,
              }}
              // ---- Drag ----
              onDragStart={(e) => beginGesture([idOf(e.target)])}
              onDrag={(e) => {
                const start = startRef.current.get(idOf(e.target));
                if (!start) return;
                stageLive(e.target, {
                  x: start.x + e.beforeTranslate[0],
                  y: start.y + e.beforeTranslate[1],
                });
              }}
              onDragEnd={() => commitGesture()}
              onDragGroupStart={(e) =>
                beginGesture(e.targets.map((t) => idOf(t)))
              }
              onDragGroup={(e) => {
                e.events.forEach((ev) => {
                  const start = startRef.current.get(idOf(ev.target));
                  if (!start) return;
                  stageLive(ev.target, {
                    x: start.x + ev.beforeTranslate[0],
                    y: start.y + ev.beforeTranslate[1],
                  });
                });
              }}
              onDragGroupEnd={() => commitGesture()}
              // ---- Resize ----
              onResizeStart={(e) => beginGesture([idOf(e.target)])}
              onResize={(e) => {
                const start = startRef.current.get(idOf(e.target));
                if (!start) return;
                stageLive(e.target, {
                  width: Math.max(8, e.width),
                  height: Math.max(8, e.height),
                  x: start.x + e.drag.beforeTranslate[0],
                  y: start.y + e.drag.beforeTranslate[1],
                });
              }}
              onResizeEnd={() => commitGesture()}
              onResizeGroupStart={(e) =>
                beginGesture(e.targets.map((t) => idOf(t)))
              }
              onResizeGroup={(e) => {
                e.events.forEach((ev) => {
                  const start = startRef.current.get(idOf(ev.target));
                  if (!start) return;
                  stageLive(ev.target, {
                    width: Math.max(8, ev.width),
                    height: Math.max(8, ev.height),
                    x: start.x + ev.drag.beforeTranslate[0],
                    y: start.y + ev.drag.beforeTranslate[1],
                  });
                });
              }}
              onResizeGroupEnd={() => commitGesture()}
              // ---- Rotate ----
              onRotateStart={(e) => beginGesture([idOf(e.target)])}
              onRotate={(e) => {
                const start = startRef.current.get(idOf(e.target));
                if (!start) return;
                stageLive(e.target, {
                  rotation: start.rotation + e.beforeRotate,
                });
              }}
              onRotateEnd={() => commitGesture()}
              onRotateGroupStart={(e) =>
                beginGesture(e.targets.map((t) => idOf(t)))
              }
              onRotateGroup={(e) => {
                e.events.forEach((ev) => {
                  const start = startRef.current.get(idOf(ev.target));
                  if (!start) return;
                  stageLive(ev.target, {
                    rotation: start.rotation + ev.beforeRotate,
                  });
                });
              }}
              onRotateGroupEnd={() => commitGesture()}
            />
          )}

          <Selecto
            ref={selectoRef}
            dragContainer={stageRef.current ?? undefined}
            selectableTargets={['[data-canvas-page] .canvas-element']}
            hitRate={0}
            selectByClick
            selectFromInside={false}
            toggleContinueSelect={['shift']}
            ratio={0}
            onDragStart={(e) => {
              const target = e.inputEvent.target as HTMLElement;
              if (editingId) {
                e.stop();
                return;
              }
              // Nếu bấm lên control của Moveable hoặc element đang chọn → nhường cho Moveable kéo.
              if (
                moveableRef.current?.isMoveableElement(target) ||
                targets.some((t) => t === target || t.contains(target))
              ) {
                e.stop();
              }
            }}
            onSelect={(e) => {
              const ids = e.selected
                .map((el) => (el as HTMLElement).dataset.elementId)
                .filter((id): id is string => !!id)
                .filter((id) => !elementById.get(id)?.locked);
              select(ids);
            }}
            onSelectEnd={(e) => {
              if (e.isDragStart) {
                e.inputEvent.preventDefault();
                requestAnimationFrame(() => {
                  moveableRef.current?.dragStart(e.inputEvent);
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
