import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '../../../context'
import type { AdminSettingsTranslations } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import type { ChangePasswordPayload } from '../../../services/auth.service'
import { Button, PasswordInput } from '../../_components'

type Values = { currentPassword: string; newPassword: string; confirmPassword: string }
type Props = { content: AdminSettingsTranslations['password']; isPending: boolean; onSave: (payload: ChangePasswordPayload) => Promise<unknown> }

function apiError(error: unknown, content: AdminSettingsTranslations['password']) {
  const envelope = getApiErrorEnvelope(error)
  if (envelope?.error.code === 'AUTH.INVALID_CREDENTIALS') return content.apiErrors.invalidCredentials
  if (envelope?.error.code === 'AUTH.PASSWORD_REUSE_NOT_ALLOWED') return content.apiErrors.passwordReuse
  if (envelope?.error.code === 'AUTH.USER_CREDENTIAL_NOT_FOUND') return content.apiErrors.credentialMissing
  return envelope?.error.message ?? content.error
}

export function AdminChangePasswordForm({ content, isPending, onSave }: Props) {
  const toast = useToast()
  const schema = useMemo(() => z.object({
    currentPassword: z.string().min(1, content.validation.currentRequired).min(8, content.validation.length).max(128, content.validation.length),
    newPassword: z.string().min(1, content.validation.nextRequired).min(8, content.validation.length).max(128, content.validation.length),
    confirmPassword: z.string().min(1, content.validation.confirmRequired),
  }).superRefine((values, context) => {
    if (values.currentPassword === values.newPassword) context.addIssue({ code: 'custom', message: content.validation.reuse, path: ['newPassword'] })
    if (values.newPassword !== values.confirmPassword) context.addIssue({ code: 'custom', message: content.validation.mismatch, path: ['confirmPassword'] })
  }), [content.validation])
  const { control, formState: { errors, isDirty }, handleSubmit, register, reset } = useForm<Values>({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }, mode: 'onBlur', resolver: zodResolver(schema) })
  const password = useWatch({ control, name: 'newPassword' }) || ''
  const rules = [
    [password.length >= 8 && password.length <= 128, content.lengthRule],
    [/[a-z]/.test(password) && /[A-Z]/.test(password), content.caseRule],
    [/\d/.test(password), content.numberRule],
    [/[^A-Za-z0-9]/.test(password), content.symbolRule],
  ] as const
  const submit = handleSubmit(async (values) => {
    try {
      await onSave({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      reset()
      toast.success(content.success)
    } catch (error) { toast.error(apiError(error, content)) }
  })

  return <section className="admin-settings-card">
    <header><h2>{content.title}</h2><p>{content.description}</p></header>
    <form className="admin-settings-password-form" noValidate onSubmit={submit}>
      <PasswordInput autoComplete="current-password" error={errors.currentPassword?.message} hidePasswordLabel={content.hide} label={content.current} showPasswordLabel={content.show} {...register('currentPassword')} />
      <PasswordInput autoComplete="new-password" error={errors.newPassword?.message} hidePasswordLabel={content.hide} label={content.next} showPasswordLabel={content.show} {...register('newPassword')} />
      <PasswordInput autoComplete="new-password" error={errors.confirmPassword?.message} hidePasswordLabel={content.hide} label={content.confirm} showPasswordLabel={content.show} {...register('confirmPassword')} />
      <div className="admin-settings-password-rules"><strong>{content.rulesTitle}</strong><ul>{rules.map(([valid, label]) => <li className={valid ? 'is-valid' : ''} key={label}><span aria-hidden="true" />{label}</li>)}</ul></div>
      <Button disabled={!isDirty || isPending} type="submit">{isPending ? content.submitting : content.submit}</Button>
    </form>
  </section>
}
