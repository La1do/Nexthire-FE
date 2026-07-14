import { Button } from '../../_components'
import type { ForgotPasswordTranslations } from '../../../i18n/types'

type EmailSentStateProps = {
  onContinue: () => void
  translations: ForgotPasswordTranslations
}

export function EmailSentState({ onContinue, translations }: EmailSentStateProps) {
  return (
    <div className="grid gap-6">
      <Button className="w-full" onClick={onContinue}>
        {translations.form.sentSubmit}
      </Button>
    </div>
  )
}
