// Mô hình dữ liệu cho CV-builder freeform (kiểu Canva).
// Mỗi trang A4 chứa các element đặt tự do (position: absolute).

import {
  CV_PAGE_WIDTH,
  CV_PAGE_HEIGHT,
} from "../../../types/cvPagination.types";

export const CANVAS_PAGE_WIDTH = CV_PAGE_WIDTH; // 794px (A4 @ 96dpi)
export const CANVAS_PAGE_HEIGHT = CV_PAGE_HEIGHT; // 1123px

export type ElementType = "text" | "image" | "shape" | "icon";

export type ShapeKind = "rect" | "ellipse" | "line";

export type TextAlign = "left" | "center" | "right";

export interface ElementBase {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  groupId?: string;
}

// Nối một ô text với field dữ liệu trong ParsedResume.
// Tách `field` và `index` thay vì dùng chuỗi kiểu 'experiences[0].companyName'
// để enum trong JSON Schema của AI chỉ có 22 giá trị thay vì hàng trăm.
// GIỮ ĐỒNG BỘ với CV_BINDING_FIELDS ở
// nexhire-BE/apps/cv-parsing-service/src/template-design/schemas/canvas-design.schema.ts
export type CvBindingField =
  // Trường đơn — index luôn null.
  | "profile.fullName"
  | "profile.headline"
  | "profile.contactEmail"
  | "profile.phone"
  | "profile.location"
  | "profile.summary"
  | "profile.linkedinUrl"
  | "profile.portfolioUrl"
  // Trường trong danh sách — index >= 0.
  | "experiences.companyName"
  | "experiences.position"
  | "experiences.period"
  | "experiences.description"
  | "educations.schoolName"
  | "educations.degree"
  | "educations.fieldOfStudy"
  | "educations.period"
  | "educations.description"
  | "skills.name"
  | "certifications.name"
  | "certifications.issuer"
  | "projects.name"
  | "projects.description";

export interface CvBinding {
  field: CvBindingField;
  index: number | null; // null cho nhóm profile.
}

export interface TextElement extends ElementBase {
  type: "text";
  text: string;
  // Optional: mọi canvas đã lưu trước đây vẫn hợp lệ, không cần migration.
  binding?: CvBinding | null;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  color: string;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageElement extends ElementBase {
  type: "image";
  src: string; // dataURL (upload) — không cần backend
  objectFit: "cover" | "contain" | "fill";
  borderRadius: number;
}

export interface ShapeElement extends ElementBase {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface IconElement extends ElementBase {
  type: "icon";
  name: string; // tên icon lucide (kebab hoặc pascal)
  color: string;
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | IconElement;

export interface CanvasPage {
  id: string;
  elements: CanvasElement[];
  background: string;
}

export interface CanvasDocument {
  id: string;
  name: string;
  pageSize: { width: number; height: number };
  pages: CanvasPage[];
}

// ---- Factory helpers ---------------------------------------------------

let idCounter = 0;
export const genId = (prefix = "el"): string => {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
};

export const createPage = (): CanvasPage => ({
  id: genId("page"),
  elements: [],
  background: "#ffffff",
});

export const createEmptyDocument = (
  name = "CV chưa đặt tên",
): CanvasDocument => ({
  id: genId("doc"),
  name,
  pageSize: {
    width: CANVAS_PAGE_WIDTH,
    height: CANVAS_PAGE_HEIGHT,
  },
  pages: [createPage()],
});

const baseDefaults = (zIndex: number): Omit<ElementBase, "id" | "type"> => ({
  x: 80,
  y: 80,
  width: 200,
  height: 60,
  rotation: 0,
  zIndex,
  opacity: 1,
  locked: false,
  hidden: false,
});

export type TextPreset = "heading" | "subheading" | "body";

export const createTextElement = (
  zIndex: number,
  preset: TextPreset = "body",
): TextElement => {
  const presetMap: Record<
    TextPreset,
    { text: string; fontSize: number; fontWeight: number; height: number }
  > = {
    heading: { text: "Tiêu đề", fontSize: 32, fontWeight: 700, height: 48 },
    subheading: {
      text: "Tiêu đề phụ",
      fontSize: 20,
      fontWeight: 600,
      height: 32,
    },
    body: {
      text: "Nội dung văn bản",
      fontSize: 14,
      fontWeight: 400,
      height: 24,
    },
  };
  const p = presetMap[preset];
  return {
    ...baseDefaults(zIndex),
    id: genId("text"),
    type: "text",
    width: 280,
    height: p.height,
    text: p.text,
    fontFamily: "Roboto, sans-serif",
    fontSize: p.fontSize,
    fontWeight: p.fontWeight,
    italic: false,
    underline: false,
    color: "#111827",
    align: "left",
    lineHeight: 1.4,
    letterSpacing: 0,
  };
};

export const createImageElement = (
  zIndex: number,
  src: string,
  width = 200,
  height = 200,
): ImageElement => ({
  ...baseDefaults(zIndex),
  id: genId("img"),
  type: "image",
  width,
  height,
  src,
  objectFit: "cover",
  borderRadius: 0,
});

export const createShapeElement = (
  zIndex: number,
  shape: ShapeKind,
): ShapeElement => ({
  ...baseDefaults(zIndex),
  id: genId("shape"),
  type: "shape",
  width: shape === "line" ? 200 : 160,
  height: shape === "line" ? 4 : 160,
  shape,
  fill: shape === "line" ? "transparent" : "#f25555",
  stroke: shape === "line" ? "#111827" : "transparent",
  strokeWidth: shape === "line" ? 3 : 0,
  borderRadius: shape === "rect" ? 8 : 0,
});

export const createIconElement = (
  zIndex: number,
  name: string,
): IconElement => ({
  ...baseDefaults(zIndex),
  id: genId("icon"),
  type: "icon",
  width: 48,
  height: 48,
  color: "#111827",
  name,
});
