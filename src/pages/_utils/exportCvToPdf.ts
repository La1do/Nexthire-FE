import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PDF_WIDTH_MM = 210;
const PDF_HEIGHT_MM = 297;

const sanitizeFileName = (name: string) =>
  name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ');

export const exportCvToPdf = async (
  fileName = 'CV',
): Promise<void> => {
  const pageElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-cv-page-content]',
    ),
  );

  if (pageElements.length === 0) {
    throw new Error('Không tìm thấy trang CV để xuất PDF.');
  }

  await document.fonts?.ready;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let index = 0; index < pageElements.length; index += 1) {
    const pageElement = pageElements[index];

    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: pageElement.offsetWidth,
      height: pageElement.offsetHeight,

      onclone: (clonedDocument) => {
        const pageId = pageElement.dataset.cvPageId;

        if (!pageId) return;

        const clonedPage =
          clonedDocument.querySelector<HTMLElement>(
            `[data-cv-page-id="${pageId}"]`,
          );

        if (!clonedPage) return;

        clonedPage.style.boxShadow = 'none';

        let parent = clonedPage.parentElement;

        while (parent) {
          parent.style.transform = 'none';
          parent.style.transition = 'none';
          parent = parent.parentElement;
        }
      },
    });

    const imageData = canvas.toDataURL(
      'image/jpeg',
      0.95,
    );

    if (index > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(
      imageData,
      'JPEG',
      0,
      0,
      PDF_WIDTH_MM,
      PDF_HEIGHT_MM,
      undefined,
      'FAST',
    );
  }

  const safeName = sanitizeFileName(fileName) || 'CV';

  pdf.save(
    safeName.toLowerCase().endsWith('.pdf')
      ? safeName
      : `${safeName}.pdf`,
  );
};