import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

export function InterviewConfirmDialog({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      // Capture before the drawer shortcuts (Escape must not close both layers).
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); cancelRef.current(); return }
      event.stopImmediatePropagation()
      if (event.key !== 'Tab') return
      const buttons = [...(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', keydown, true)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown, true); previous?.focus() }
  }, [])
  return createPortal(<div className="interview-confirm-backdrop" onClick={onCancel}>
    <div ref={ref} className="interview-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} onClick={event => event.stopPropagation()}>
      <span className="interview-confirm-dialog__eyebrow">PHIẾU PHỎNG VẤN</span>
      <h2 id={titleId}>Xác nhận thao tác</h2>
      <p id={descriptionId}>{message}</p>
      <div className="interview-confirm-dialog__actions"><button type="button" onClick={onCancel}>Quay lại chỉnh sửa</button><button type="button" onClick={onConfirm}>Xác nhận tiếp tục</button></div>
    </div>
  </div>, document.body)
}
