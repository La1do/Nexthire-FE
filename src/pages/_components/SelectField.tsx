import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'

export type SelectFieldOption = {
  label: string
  value: string
}

type SelectFieldProps = {
  className?: string
  compact?: boolean
  defaultValue?: string
  disabled?: boolean
  hideLabel?: boolean
  icon?: ReactNode
  id?: string
  label: string
  name?: string
  onChange?: (value: string) => void
  options: ReadonlyArray<SelectFieldOption>
  placeholder?: string
  value?: string
}

type MenuPlacement = 'bottom' | 'top'

const MENU_GAP = 8
const MENU_MAX_HEIGHT = 288
const VIEWPORT_GUTTER = 12

function getInitialValue(options: ReadonlyArray<SelectFieldOption>, value?: string) {
  if (value !== undefined) {
    return value
  }

  return options[0]?.value ?? ''
}

export function SelectField({
  className = '',
  compact = false,
  defaultValue,
  disabled = false,
  hideLabel = false,
  icon,
  id,
  label,
  name,
  onChange,
  options,
  placeholder,
  value,
}: SelectFieldProps) {
  const generatedId = useId()
  const buttonId = id ?? generatedId
  const menuId = `${buttonId}-menu`
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => getInitialValue(options, defaultValue))
  const [isOpen, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>()
  const [menuPlacement, setMenuPlacement] = useState<MenuPlacement>('bottom')
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const currentValue = isControlled ? value : internalValue
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === currentValue),
    0,
  )
  const selectedOption = options[selectedIndex]
  const displayValue = selectedOption?.label ?? placeholder ?? label
  const rootClasses = [
    'select-field',
    compact ? 'select-field--compact' : '',
    hideLabel ? 'select-field--hidden-label' : '',
    isOpen ? 'is-open' : '',
    disabled ? 'is-disabled' : '',
    className,
  ].filter(Boolean).join(' ')

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(getInitialValue(options, defaultValue))
    }
  }, [defaultValue, isControlled, options])

  function updateMenuPosition() {
    const button = buttonRef.current

    if (!button) {
      return
    }

    const rect = button.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GUTTER
    const spaceAbove = rect.top - VIEWPORT_GUTTER
    const shouldOpenUp = spaceBelow < 220 && spaceAbove > spaceBelow
    const maxHeight = Math.min(MENU_MAX_HEIGHT, Math.max(160, shouldOpenUp ? spaceAbove : spaceBelow))
    const top = shouldOpenUp
      ? Math.max(VIEWPORT_GUTTER, rect.top - maxHeight - MENU_GAP)
      : Math.min(window.innerHeight - VIEWPORT_GUTTER, rect.bottom + MENU_GAP)

    setMenuPlacement(shouldOpenUp ? 'top' : 'bottom')
    setMenuStyle({
      left: rect.left,
      maxHeight,
      minWidth: rect.width,
      top,
      width: rect.width,
    })
  }

  function openMenu(nextIndex = selectedIndex) {
    if (disabled) {
      return
    }

    setActiveIndex(nextIndex)
    setOpen(true)
    requestAnimationFrame(updateMenuPosition)
  }

  function closeMenu() {
    setOpen(false)
  }

  function selectValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue)
    }

    onChange?.(nextValue)
    closeMenu()
    buttonRef.current?.focus()
  }

  function moveActiveIndex(direction: 1 | -1) {
    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + direction

      if (nextIndex < 0) {
        return options.length - 1
      }

      if (nextIndex >= options.length) {
        return 0
      }

      return nextIndex
    })
  }

  function handleButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()

      if (!isOpen) {
        openMenu(selectedIndex)
        return
      }

      moveActiveIndex(1)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      if (!isOpen) {
        openMenu(selectedIndex)
        return
      }

      moveActiveIndex(-1)
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      if (!isOpen) {
        openMenu(selectedIndex)
        return
      }

      const activeOption = options[activeIndex]

      if (activeOption) {
        selectValue(activeOption.value)
      }
    }

    if (event.key === 'Tab') {
      closeMenu()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node

      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }

      closeMenu()
    }

    function handleWindowChange() {
      updateMenuPosition()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', handleWindowChange)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('resize', handleWindowChange)
    }
  }, [isOpen])

  const menu = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          className={`select-field__menu select-field__menu--${menuPlacement}`}
          id={menuId}
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isActive = index === activeIndex
            const isSelected = option.value === currentValue

            return (
              <button
                aria-selected={isSelected}
                className={`select-field__option${isActive ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                key={option.value}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectValue(option.value)}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected ? <span aria-hidden="true" className="select-field__check" /> : null}
              </button>
            )
          })}
        </div>,
        document.body,
      )
    : null

  return (
    <div className={rootClasses}>
      <span className={hideLabel ? 'sr-only' : 'select-field__label'} id={`${buttonId}-label`}>
        {label}
      </span>
      {name ? <input name={name} type="hidden" value={currentValue} /> : null}
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${buttonId}-label ${buttonId}-value`}
        className="select-field__button"
        disabled={disabled}
        id={buttonId}
        onClick={() => (isOpen ? closeMenu() : openMenu(selectedIndex))}
        onKeyDown={handleButtonKeyDown}
        ref={buttonRef}
        type="button"
      >
        {icon ? <span aria-hidden="true" className="select-field__icon">{icon}</span> : null}
        <span className="select-field__value" id={`${buttonId}-value`}>
          {displayValue}
        </span>
        <span aria-hidden="true" className="select-field__chevron" />
      </button>
      {menu}
    </div>
  )
}
