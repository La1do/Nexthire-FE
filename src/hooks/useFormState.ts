import { useState } from 'react'
import type { ChangeEventHandler, FormEventHandler } from 'react'

export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>
export type FormTouched<TValues> = Partial<Record<keyof TValues, boolean>>

type UseFormStateOptions<TValues extends Record<string, unknown>> = {
  initialValues: TValues
  validate: (values: TValues) => FormErrors<TValues>
  onSubmit: (values: TValues) => void
}

function markAllFieldsTouched<TValues extends Record<string, unknown>>(values: TValues) {
  return (Object.keys(values) as Array<keyof TValues>).reduce<FormTouched<TValues>>((touched, field) => {
    touched[field] = true
    return touched
  }, {})
}

function hasValidationErrors<TValues>(errors: FormErrors<TValues>) {
  return Object.values(errors).some(Boolean)
}

export function useFormState<TValues extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormStateOptions<TValues>) {
  const [values, setValues] = useState<TValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors<TValues>>({})
  const [touched, setTouched] = useState<FormTouched<TValues>>({})
  const [submitted, setSubmitted] = useState(false)

  const setFieldValue = <TField extends keyof TValues>(field: TField, value: TValues[TField]) => {
    setValues((currentValues) => {
      const nextValues = { ...currentValues, [field]: value } as TValues

      if (submitted || touched[field]) {
        setErrors(validate(nextValues))
      }

      return nextValues
    })
  }

  const setFieldTouched = <TField extends keyof TValues>(field: TField) => {
    setTouched((currentTouched) => ({ ...currentTouched, [field]: true }))
    setErrors(validate(values))
  }

  const handleFieldChange =
    <TField extends keyof TValues>(field: TField): ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      setFieldValue(field, event.target.value as TValues[TField])
    }

  const handleCheckboxChange =
    <TField extends keyof TValues>(field: TField): ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      setFieldValue(field, event.target.checked as TValues[TField])
    }

  const getFieldError = <TField extends keyof TValues>(field: TField) => {
    if (!submitted && !touched[field]) {
      return undefined
    }

    return errors[field]
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const nextErrors = validate(values)

    setSubmitted(true)
    setTouched(markAllFieldsTouched(values))
    setErrors(nextErrors)

    if (!hasValidationErrors(nextErrors)) {
      onSubmit(values)
    }
  }

  return {
    errors,
    getFieldError,
    handleCheckboxChange,
    handleFieldChange,
    handleSubmit,
    setFieldTouched,
    setFieldValue,
    touched,
    values,
  }
}
