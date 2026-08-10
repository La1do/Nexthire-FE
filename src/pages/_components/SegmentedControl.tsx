import { useId } from 'react'
import type { CSSProperties } from 'react'

type SegmentedControlOption = {
  value: string
  label: string
}

type SegmentedControlProps = {
  label: string
  name: string
  onChange: (value: string) => void
  options: ReadonlyArray<SegmentedControlOption>
  value: string
}

export function SegmentedControl({ label, name, onChange, options, value }: SegmentedControlProps) {
  const labelId = useId()
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )
  const controlStyle = {
    '--segment-count': options.length,
    '--segment-index': activeIndex,
  } as CSSProperties

  return (
    <fieldset className="grid gap-3">
      <legend className="text-base font-medium text-[var(--color-text-secondary)]" id={labelId}>
        {label}
      </legend>
      <div
        aria-labelledby={labelId}
        className="segmented-control rounded-lg bg-[var(--color-surface-muted)] p-1"
        role="radiogroup"
        style={controlStyle}
      >
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              aria-checked={isSelected}
              className={`segmented-control-option min-h-12 rounded-md px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-solid)] sm:px-4 sm:text-base ${
                isSelected
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              key={option.value}
              name={name}
              onClick={() => onChange(option.value)}
              role="radio"
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
