import { Button } from '../../_components'
import type { ForgotPasswordTranslations } from '../../../i18n/types'

type EmailSentStateProps = {
  buttonLabel?: string
  onContinue: () => void
  translations: ForgotPasswordTranslations
}

export function EmailSentState({ buttonLabel, onContinue, translations }: EmailSentStateProps) {
  return (
    <div className="grid gap-6">
      <Button className="w-full" onClick={onContinue}>
        {buttonLabel ?? translations.form.sentSubmit}
      </Button>
    </div>
  )
}
