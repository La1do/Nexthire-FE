import type { ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string
}

export function Input({ className = '', id, label, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replaceAll(' ', '-')

  return (
    <label className="grid gap-2 text-sm font-medium text-[#3b414b]" htmlFor={inputId}>
      {label}
      <input
        className={`h-11 rounded-md border border-[#cfd4c7] bg-white px-3 text-sm text-[#20242c] outline-none transition placeholder:text-[#8a929f] focus:border-[#116a5b] focus:ring-2 focus:ring-[#116a5b]/15 ${className}`}
        id={inputId}
        {...props}
      />
    </label>
  )
}
