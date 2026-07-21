import { useEffect, useRef, useState } from 'react'
import { Button } from '../../_components'
import type { Locale, LoginTranslations } from '../../../i18n/types'

type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleButtonOptions = {
  locale?: string
  logo_alignment?: 'left' | 'center'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  type?: 'standard' | 'icon'
  width?: number
}

type GoogleAccountsId = {
  initialize: (options: {
    auto_select?: boolean
    callback: (response: GoogleCredentialResponse) => void
    cancel_on_tap_outside?: boolean
    client_id: string
    nonce?: string
  }) => void
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId
      }
    }
  }
}

type GoogleLoginButtonProps = {
  disabled: boolean
  locale: Locale
  onCredential: (idToken: string) => void
  onError: (message: string) => void
  translations: LoginTranslations['form']
}

const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let googleIdentityScriptPromise: Promise<void> | null = null

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`,
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Google identity script failed')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Google identity script failed')), { once: true })
    document.head.appendChild(script)
  })

  return googleIdentityScriptPromise
}

export function GoogleLoginButton({
  disabled,
  locale,
  onCredential,
  onError,
  translations,
}: GoogleLoginButtonProps) {
  const buttonSlotRef = useRef<HTMLDivElement | null>(null)
  const onCredentialRef = useRef(onCredential)
  const onErrorRef = useRef(onError)
  const [isReady, setReady] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    onCredentialRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!googleClientId) {
      return
    }

    let isActive = true

    loadGoogleIdentityScript()
      .then(() => {
        if (!isActive || !buttonSlotRef.current) {
          return
        }

        const googleAccountsId = window.google?.accounts?.id

        if (!googleAccountsId) {
          throw new Error('Google identity script loaded without accounts API')
        }

        googleAccountsId.initialize({
          auto_select: false,
          callback: (response) => {
            if (!response.credential) {
              onErrorRef.current(translations.googleCredentialMissing)
              return
            }

            onCredentialRef.current(response.credential)
          },
          cancel_on_tap_outside: true,
          client_id: googleClientId,
        })

        buttonSlotRef.current.replaceChildren()
        googleAccountsId.renderButton(buttonSlotRef.current, {
          locale,
          logo_alignment: 'left',
          shape: 'rectangular',
          size: 'large',
          text: 'continue_with',
          theme: 'outline',
          type: 'standard',
          width: 360,
        })
        setReady(true)
      })
      .catch(() => {
        if (isActive) {
          onErrorRef.current(translations.googleLoadError)
        }
      })

    return () => {
      isActive = false
    }
  }, [googleClientId, locale, translations.googleCredentialMissing, translations.googleLoadError])

  if (!googleClientId) {
    return (
      <Button className="w-full" disabled type="button" variant="secondary">
        {translations.googleUnavailable}
      </Button>
    )
  }

  return (
    <div aria-label={translations.googleAriaLabel} className={disabled ? 'pointer-events-none opacity-60' : ''}>
      {!isReady ? (
        <Button className="w-full" disabled type="button" variant="secondary">
          {translations.googleLoading}
        </Button>
      ) : null}
      <div
        className={`flex min-h-12 w-full justify-center overflow-hidden rounded-lg ${isReady ? '' : 'hidden'}`}
        ref={buttonSlotRef}
      />
    </div>
  )
}
