import { useId } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label: string
}

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label
      className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--color-text-secondary)]"
      htmlFor={inputId}
    >
      <input
        className="size-5 rounded border-[var(--color-border-default)] accent-[var(--color-brand-solid)]"
        id={inputId}
        type="checkbox"
        {...props}
      />
      <span>{label}</span>
    </label>
  )
}
