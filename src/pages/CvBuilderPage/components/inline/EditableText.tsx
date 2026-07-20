import { useRef, useEffect, useLayoutEffect } from 'react';
import type { KeyboardEvent, ElementType } from 'react';

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  as?: ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export const EditableText = ({
  value,
  onCommit,
  as: Tag = 'span',
  className = '',
  placeholder = '',
  multiline = false,
}: EditableTextProps) => {
  const ref = useRef<HTMLElement>(null);

  
  useLayoutEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const handleBlur = () => {
    const text = ref.current?.innerText.trim() ?? '';
    if (text !== value) onCommit(text);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      if (ref.current) ref.current.innerText = value;
      ref.current?.blur();
    }
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={`rounded-sm outline-none transition-colors hover:bg-[#fef3f8] focus:bg-[#fef3f8] focus:ring-1 focus:ring-[#f23b94] empty:before:text-[#9ca3af] empty:before:content-[attr(data-placeholder)] ${className}`}
    />
  );
};