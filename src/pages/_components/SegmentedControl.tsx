import { useId } from 'react'

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

  return (
    <fieldset className="grid gap-3">
      <legend className="text-base font-medium text-[var(--color-text-secondary)]" id={labelId}>
        {label}
      </legend>
      <div
        aria-labelledby={labelId}
        className="grid rounded-lg bg-[var(--color-surface-muted)] p-1 sm:grid-cols-2"
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              aria-checked={isSelected}
              className={`min-h-12 rounded-md px-4 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-solid)] ${
                isSelected
                  ? 'bg-[var(--color-surface-card)] text-[var(--color-text-primary)] shadow-[var(--shadow-control)]'
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
