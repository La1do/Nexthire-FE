import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '../../../context'
import type { AdminSettingsTranslations } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import type { AuthProfile, UpdateAuthProfilePayload } from '../../../services/auth.service'
import { Button } from '../../_components'

type Values = { fullName: string; phone: string }
type Props = { content: AdminSettingsTranslations['profile']; isPending: boolean; onSave: (payload: UpdateAuthProfilePayload) => Promise<AuthProfile>; profile: AuthProfile }

export function AdminProfileForm({ content, isPending, onSave, profile }: Props) {
  const toast = useToast()
  const schema = useMemo(() => z.object({
    fullName: z.string().trim().min(1, content.validation.fullNameRequired).min(2, content.validation.fullNameMin).max(255, content.validation.fullNameMax),
    phone: z.string().trim().max(30, content.validation.phoneMax).refine((value) => !value || /^[+\d][\d\s().-]{7,29}$/.test(value), content.validation.phoneInvalid),
  }), [content.validation])
  const { formState: { errors, isDirty }, handleSubmit, register, reset } = useForm<Values>({
    defaultValues: { fullName: profile.fullName ?? '', phone: profile.phone ?? '' }, mode: 'onBlur', resolver: zodResolver(schema),
  })

  useEffect(() => reset({ fullName: profile.fullName ?? '', phone: profile.phone ?? '' }), [profile, reset])

  const submit = handleSubmit(async (values) => {
    try {
      const updated = await onSave({ fullName: values.fullName.trim(), phone: values.phone.trim() || null })
      reset({ fullName: updated.fullName ?? '', phone: updated.phone ?? '' })
      toast.success(content.saveSuccess)
    } catch (error) {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.saveError)
    }
  })

  return <section className="admin-settings-card">
    <header><h2>{content.title}</h2><p>{content.description}</p></header>
    <form className="admin-settings-form" noValidate onSubmit={submit}>
      <div className="admin-settings-form__grid">
        <label><span>{content.fullName}</span><input autoComplete="name" placeholder={content.fullNamePlaceholder} {...register('fullName')} />{errors.fullName ? <small>{errors.fullName.message}</small> : null}</label>
        <label><span>{content.phone}</span><input autoComplete="tel" placeholder={content.phonePlaceholder} type="tel" {...register('phone')} />{errors.phone ? <small>{errors.phone.message}</small> : null}</label>
        <label><span>{content.email}</span><input readOnly type="email" value={profile.email} /><em>{content.emailHint}</em></label>
        <label><span>{content.role}</span><input readOnly value={profile.role} /></label>
      </div>
      <div className="admin-settings-form__actions">
        <Button disabled={!isDirty || isPending} type="submit">{isPending ? content.saving : content.save}</Button>
        <Button disabled={!isDirty || isPending} onClick={() => reset()} variant="secondary">{content.reset}</Button>
      </div>
    </form>
  </section>
}
