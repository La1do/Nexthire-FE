// Bộ template CV dựng sẵn (freeform). Mỗi template build ra CanvasPage[]
// với id mới mỗi lần áp dụng để tránh trùng id.
import {
  genId,
  CANVAS_PAGE_WIDTH,
  CANVAS_PAGE_HEIGHT,
  type CanvasElement,
  type CanvasPage,
  type IconElement,
  type ShapeElement,
  type TextElement,
} from './canvas.types';

interface Builder {
  z: number;
}

const mkText = (
  b: Builder,
  o: Partial<TextElement> & {
    text: string;
    x: number;
    y: number;
    width: number;
  },
): TextElement => {
  b.z += 1;
  return {
    id: genId('text'),
    type: 'text',
    height: 28,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    italic: false,
    underline: false,
    color: '#111827',
    align: 'left',
    lineHeight: 1.4,
    letterSpacing: 0,
    zIndex: b.z,
    ...o,
  };
};

const mkRect = (
  b: Builder,
  o: Partial<ShapeElement> & {
    x: number;
    y: number;
    width: number;
    height: number;
  },
): ShapeElement => {
  b.z += 1;
  return {
    id: genId('shape'),
    type: 'shape',
    shape: 'rect',
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fill: '#2563eb',
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 0,
    zIndex: b.z,
    ...o,
  };
};

const mkEllipse = (
  b: Builder,
  o: Partial<ShapeElement> & {
    x: number;
    y: number;
    width: number;
    height: number;
  },
): ShapeElement => ({
  ...mkRect(b, o),
  id: genId('shape'),
  shape: 'ellipse',
});

const mkLine = (
  b: Builder,
  o: { x: number; y: number; width: number; stroke?: string; strokeWidth?: number },
): ShapeElement => {
  b.z += 1;
  return {
    id: genId('shape'),
    type: 'shape',
    shape: 'line',
    x: o.x,
    y: o.y,
    width: o.width,
    height: 4,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fill: 'transparent',
    stroke: o.stroke ?? '#111827',
    strokeWidth: o.strokeWidth ?? 2,
    borderRadius: 0,
    zIndex: b.z,
  };
};

const mkIcon = (
  b: Builder,
  o: { name: string; x: number; y: number; size?: number; color?: string },
): IconElement => {
  b.z += 1;
  const size = o.size ?? 18;
  return {
    id: genId('icon'),
    type: 'icon',
    name: o.name,
    x: o.x,
    y: o.y,
    width: size,
    height: size,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    color: o.color ?? '#111827',
    zIndex: b.z,
  };
};

const wrap = (elements: CanvasElement[], background = '#ffffff'): CanvasPage[] => [
  { id: genId('page'), elements, background },
];

// ---- Template 1: Chuyên nghiệp (header màu) ---------------------------
const buildProfessional = (): CanvasPage[] => {
  const b: Builder = { z: 0 };
  const accent = '#2563eb';
  const els: CanvasElement[] = [
    mkRect(b, { x: 0, y: 0, width: CANVAS_PAGE_WIDTH, height: 160, fill: accent }),
    mkText(b, {
      text: 'NGUYỄN VĂN A',
      x: 48,
      y: 42,
      width: 500,
      height: 46,
      fontSize: 36,
      fontWeight: 800,
      color: '#ffffff',
    }),
    mkText(b, {
      text: 'Kỹ sư phần mềm',
      x: 48,
      y: 96,
      width: 500,
      height: 28,
      fontSize: 18,
      color: '#dbeafe',
    }),
    mkIcon(b, { name: 'mail', x: 48, y: 190, color: accent }),
    mkText(b, { text: 'email@example.com', x: 76, y: 189, width: 240 }),
    mkIcon(b, { name: 'phone', x: 320, y: 190, color: accent }),
    mkText(b, { text: '0123 456 789', x: 348, y: 189, width: 200 }),
    mkIcon(b, { name: 'map-pin', x: 540, y: 190, color: accent }),
    mkText(b, { text: 'Hà Nội', x: 568, y: 189, width: 180 }),

    mkText(b, {
      text: 'KINH NGHIỆM LÀM VIỆC',
      x: 48,
      y: 250,
      width: 400,
      height: 26,
      fontSize: 18,
      fontWeight: 700,
      color: accent,
    }),
    mkLine(b, { x: 48, y: 282, width: 698, stroke: accent, strokeWidth: 2 }),
    mkText(b, {
      text: 'Senior Frontend Developer — Công ty ABC',
      x: 48,
      y: 296,
      width: 600,
      height: 24,
      fontSize: 15,
      fontWeight: 600,
    }),
    mkText(b, {
      text: '01/2022 - Hiện tại',
      x: 48,
      y: 320,
      width: 300,
      height: 20,
      fontSize: 13,
      color: '#6b7280',
    }),
    mkText(b, {
      text: '- Phát triển sản phẩm với hàng triệu người dùng.\n- Tối ưu hiệu năng ứng dụng React.\n- Hướng dẫn thành viên mới.',
      x: 48,
      y: 344,
      width: 660,
      height: 78,
      fontSize: 14,
      lineHeight: 1.6,
    }),

    mkText(b, {
      text: 'HỌC VẤN',
      x: 48,
      y: 448,
      width: 400,
      height: 26,
      fontSize: 18,
      fontWeight: 700,
      color: accent,
    }),
    mkLine(b, { x: 48, y: 480, width: 698, stroke: accent, strokeWidth: 2 }),
    mkText(b, {
      text: 'Đại học Bách Khoa Hà Nội',
      x: 48,
      y: 494,
      width: 500,
      height: 24,
      fontSize: 15,
      fontWeight: 600,
    }),
    mkText(b, {
      text: 'Công nghệ Thông tin · 2016 - 2020',
      x: 48,
      y: 518,
      width: 500,
      height: 20,
      fontSize: 13,
      color: '#6b7280',
    }),

    mkText(b, {
      text: 'KỸ NĂNG',
      x: 48,
      y: 566,
      width: 400,
      height: 26,
      fontSize: 18,
      fontWeight: 700,
      color: accent,
    }),
    mkLine(b, { x: 48, y: 598, width: 698, stroke: accent, strokeWidth: 2 }),
    mkText(b, {
      text: 'React · TypeScript · Node.js · PostgreSQL · Git',
      x: 48,
      y: 612,
      width: 660,
      height: 24,
      fontSize: 14,
    }),
  ];
  return wrap(els);
};

// ---- Template 2: Tối giản --------------------------------------------
const buildMinimal = (): CanvasPage[] => {
  const b: Builder = { z: 0 };
  const els: CanvasElement[] = [
    mkText(b, {
      text: 'NGUYỄN VĂN A',
      x: 97,
      y: 80,
      width: 600,
      height: 52,
      fontSize: 42,
      fontWeight: 300,
      letterSpacing: 2,
      align: 'center',
    }),
    mkText(b, {
      text: 'KỸ SƯ PHẦN MỀM',
      x: 97,
      y: 138,
      width: 600,
      height: 24,
      fontSize: 15,
      letterSpacing: 4,
      color: '#6b7280',
      align: 'center',
    }),
    mkText(b, {
      text: 'email@example.com   ·   0123 456 789   ·   Hà Nội',
      x: 97,
      y: 172,
      width: 600,
      height: 22,
      fontSize: 13,
      color: '#6b7280',
      align: 'center',
    }),
    mkLine(b, { x: 297, y: 208, width: 200, stroke: '#111827', strokeWidth: 1 }),

    mkText(b, {
      text: 'Kinh nghiệm',
      x: 97,
      y: 248,
      width: 600,
      height: 26,
      fontSize: 20,
      fontWeight: 600,
    }),
    mkText(b, {
      text: 'Senior Frontend Developer, Công ty ABC — 2022 đến nay',
      x: 97,
      y: 282,
      width: 600,
      height: 22,
      fontSize: 14,
      fontWeight: 600,
    }),
    mkText(b, {
      text: 'Phát triển và tối ưu ứng dụng web quy mô lớn, dẫn dắt nhóm nhỏ.',
      x: 97,
      y: 306,
      width: 600,
      height: 44,
      fontSize: 14,
      color: '#374151',
      lineHeight: 1.6,
    }),

    mkText(b, {
      text: 'Học vấn',
      x: 97,
      y: 372,
      width: 600,
      height: 26,
      fontSize: 20,
      fontWeight: 600,
    }),
    mkText(b, {
      text: 'Đại học Bách Khoa Hà Nội — Công nghệ Thông tin, 2016-2020',
      x: 97,
      y: 406,
      width: 600,
      height: 22,
      fontSize: 14,
    }),

    mkText(b, {
      text: 'Kỹ năng',
      x: 97,
      y: 456,
      width: 600,
      height: 26,
      fontSize: 20,
      fontWeight: 600,
    }),
    mkText(b, {
      text: 'React · TypeScript · Node.js · PostgreSQL · UI/UX',
      x: 97,
      y: 490,
      width: 600,
      height: 22,
      fontSize: 14,
      color: '#374151',
    }),
  ];
  return wrap(els);
};

// ---- Template 3: Hiện đại (2 cột) ------------------------------------
const buildModern = (): CanvasPage[] => {
  const b: Builder = { z: 0 };
  const sidebar = '#1f2937';
  const accent = '#38bdf8';
  const els: CanvasElement[] = [
    mkRect(b, { x: 0, y: 0, width: 280, height: CANVAS_PAGE_HEIGHT, fill: sidebar }),
    mkEllipse(b, { x: 80, y: 56, width: 120, height: 120, fill: '#374151' }),

    mkText(b, {
      text: 'LIÊN HỆ',
      x: 32,
      y: 210,
      width: 216,
      height: 22,
      fontSize: 14,
      fontWeight: 700,
      color: accent,
      letterSpacing: 1,
    }),
    mkIcon(b, { name: 'mail', x: 32, y: 244, color: accent, size: 16 }),
    mkText(b, {
      text: 'email@example.com',
      x: 56,
      y: 243,
      width: 200,
      height: 20,
      fontSize: 12,
      color: '#e5e7eb',
    }),
    mkIcon(b, { name: 'phone', x: 32, y: 272, color: accent, size: 16 }),
    mkText(b, {
      text: '0123 456 789',
      x: 56,
      y: 271,
      width: 200,
      height: 20,
      fontSize: 12,
      color: '#e5e7eb',
    }),
    mkIcon(b, { name: 'map-pin', x: 32, y: 300, color: accent, size: 16 }),
    mkText(b, {
      text: 'Hà Nội, Việt Nam',
      x: 56,
      y: 299,
      width: 200,
      height: 20,
      fontSize: 12,
      color: '#e5e7eb',
    }),

    mkText(b, {
      text: 'KỸ NĂNG',
      x: 32,
      y: 356,
      width: 216,
      height: 22,
      fontSize: 14,
      fontWeight: 700,
      color: accent,
      letterSpacing: 1,
    }),
    mkText(b, {
      text: 'React / Next.js\nTypeScript\nNode.js\nPostgreSQL\nUI/UX Design',
      x: 32,
      y: 388,
      width: 216,
      height: 120,
      fontSize: 13,
      color: '#e5e7eb',
      lineHeight: 1.9,
    }),

    // Cột phải
    mkText(b, {
      text: 'NGUYỄN VĂN A',
      x: 320,
      y: 64,
      width: 430,
      height: 44,
      fontSize: 34,
      fontWeight: 800,
      color: '#111827',
    }),
    mkText(b, {
      text: 'Kỹ sư phần mềm',
      x: 320,
      y: 112,
      width: 430,
      height: 26,
      fontSize: 17,
      color: accent,
      fontWeight: 600,
    }),
    mkLine(b, { x: 320, y: 150, width: 426, stroke: '#e5e7eb', strokeWidth: 2 }),

    mkText(b, {
      text: 'KINH NGHIỆM',
      x: 320,
      y: 178,
      width: 430,
      height: 24,
      fontSize: 17,
      fontWeight: 700,
      color: sidebar,
    }),
    mkText(b, {
      text: 'Senior Frontend Developer — Công ty ABC',
      x: 320,
      y: 210,
      width: 430,
      height: 22,
      fontSize: 14,
      fontWeight: 600,
    }),
    mkText(b, {
      text: '2022 - Hiện tại',
      x: 320,
      y: 232,
      width: 430,
      height: 20,
      fontSize: 12,
      color: '#6b7280',
    }),
    mkText(b, {
      text: 'Phát triển sản phẩm hàng triệu người dùng, tối ưu hiệu năng và dẫn dắt nhóm.',
      x: 320,
      y: 256,
      width: 430,
      height: 48,
      fontSize: 13,
      color: '#374151',
      lineHeight: 1.6,
    }),

    mkText(b, {
      text: 'HỌC VẤN',
      x: 320,
      y: 330,
      width: 430,
      height: 24,
      fontSize: 17,
      fontWeight: 700,
      color: sidebar,
    }),
    mkText(b, {
      text: 'Đại học Bách Khoa Hà Nội',
      x: 320,
      y: 362,
      width: 430,
      height: 22,
      fontSize: 14,
      fontWeight: 600,
    }),
    mkText(b, {
      text: 'Công nghệ Thông tin · 2016 - 2020',
      x: 320,
      y: 384,
      width: 430,
      height: 20,
      fontSize: 12,
      color: '#6b7280',
    }),
  ];
  return wrap(els);
};

export interface CvTemplate {
  id: string;
  name: string;
  description: string;
  accent: string;
  build: () => CanvasPage[];
}

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: 'professional',
    name: 'Chuyên nghiệp',
    description: 'Header màu nổi bật, bố cục 1 cột rõ ràng.',
    accent: '#2563eb',
    build: buildProfessional,
  },
  {
    id: 'minimal',
    name: 'Tối giản',
    description: 'Nhiều khoảng trắng, canh giữa, thanh lịch.',
    accent: '#111827',
    build: buildMinimal,
  },
  {
    id: 'modern',
    name: 'Hiện đại',
    description: 'Sidebar tối 2 cột, có chỗ đặt ảnh đại diện.',
    accent: '#1f2937',
    build: buildModern,
  },
];
