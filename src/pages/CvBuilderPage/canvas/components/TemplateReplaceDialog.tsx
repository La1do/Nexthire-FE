import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { CvTemplatesTranslations } from '../../../../i18n/types';

type TemplateReplaceDialogProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  templateName: string;
  translations: CvTemplatesTranslations['templateReplaceDialog'];
};

export function TemplateReplaceDialog({
  isOpen,
  onCancel,
  onConfirm,
  templateName,
  translations,
}: TemplateReplaceDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    cancelButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-describedby="template-replace-dialog-description"
      aria-labelledby="template-replace-dialog-title"
      aria-modal="true"
      className="template-replace-dialog"
      role="dialog"
    >
      <div
        className="template-replace-dialog__backdrop"
        onMouseDown={onCancel}
      />
      <section className="template-replace-dialog__panel">
        <header className="template-replace-dialog__header">
          <span aria-hidden="true" className="template-replace-dialog__icon">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 id="template-replace-dialog-title">{translations.title}</h2>
            <p id="template-replace-dialog-description">{translations.description}</p>
          </div>
          <button
            aria-label={translations.cancel}
            className="template-replace-dialog__close"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        <div className="template-replace-dialog__template">
          <span>{translations.templateLabel}</span>
          <strong>{templateName}</strong>
        </div>

        <footer className="template-replace-dialog__actions">
          <button
            className="template-replace-dialog__button template-replace-dialog__button--secondary"
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            {translations.cancel}
          </button>
          <button
            className="template-replace-dialog__button template-replace-dialog__button--primary"
            onClick={onConfirm}
            type="button"
          >
            {translations.confirm}
          </button>
        </footer>
      </section>
    </div>
  );
}
