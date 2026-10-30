import { useState } from 'react'
import type { AuthFlowResult, SignInValues, SignUpValues } from './types'
import { validateEmail, validatePassword, validatePasswordConfirmation, validateUsername } from './validation'

interface DemoSigninProps {
  onContinue: (displayName: string) => Promise<void>
  onSignIn: (values: SignInValues) => Promise<AuthFlowResult>
  onSignUp: (values: SignUpValues) => Promise<AuthFlowResult>
}

type Mode = 'demo' | 'sign-in' | 'sign-up'

export function DemoSignin({ onContinue, onSignIn, onSignUp }: DemoSigninProps) {
  const [mode, setMode] = useState<Mode>('demo')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setError('')
    setNotice('')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setError('')
    setNotice('')

    const fieldError = mode === 'demo'
      ? validateUsername(displayName)
      : mode === 'sign-in'
        ? validateEmail(email) || validatePassword(password)
        : validateUsername(username) || validateEmail(email) || validatePassword(password) || validatePasswordConfirmation(password, confirmPassword)
    if (fieldError) {
      setError(fieldError)
      return
    }

    setIsSubmitting(true)
    try {
      let result: AuthFlowResult = 'ready'
      if (mode === 'demo') {
        await onContinue(displayName.trim())
      } else if (mode === 'sign-in') {
        result = await onSignIn({ email, password })
      } else {
        result = await onSignUp({ username: username.trim(), email, password, confirmPassword })
      }

      if (result === 'confirmation-required') {
        setMode('sign-in')
        setPassword('')
        setConfirmPassword('')
        setNotice('Check your email to confirm your account, then sign in here.')
      } else if (result === 'profile-setup') {
        setMode('demo')
        setNotice('Your account is signed in. Choose a display name to finish setting up your profile.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = mode === 'demo' ? 'Choose a display name' : mode === 'sign-in' ? 'Welcome back' : 'Create your account'
  const intro = mode === 'demo'
    ? 'Create or resume an anonymous demo profile. This is not secure authentication.'
    : mode === 'sign-in'
      ? 'Sign in with your permanent email and password.'
      : 'Save your profile so you can recover it on another device.'

  return (
    <main className="signin-root">
      <section className="signin-card" aria-labelledby="demo-signin-title">
        <p className="signin-eyebrow">{mode === 'demo' ? 'Demo profile selector' : 'Account access'}</p>
        <h1 id="demo-signin-title">{title}</h1>
        <p className="signin-intro">{intro}</p>
        <form onSubmit={submit} noValidate>
          {mode === 'demo' && <label className="signin-field" htmlFor="demo-display-name"><span>Display name</span><input id="demo-display-name" type="text" value={displayName} onChange={event => setDisplayName(event.target.value)} autoComplete="nickname" aria-invalid={Boolean(error)} disabled={isSubmitting} /></label>}
          {mode === 'sign-up' && <label className="signin-field" htmlFor="demo-username"><span>Username</span><input id="demo-username" type="text" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" aria-invalid={Boolean(error)} disabled={isSubmitting} /></label>}
          {mode !== 'demo' && <label className="signin-field" htmlFor="account-email"><span>Email</span><input id="account-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" aria-invalid={Boolean(error)} disabled={isSubmitting} /></label>}
          {mode !== 'demo' && <label className="signin-field" htmlFor="account-password"><span>Password</span><input id="account-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} aria-invalid={Boolean(error)} disabled={isSubmitting} /></label>}
          {mode === 'sign-up' && <label className="signin-field" htmlFor="account-confirm-password"><span>Confirm password</span><input id="account-confirm-password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" aria-invalid={Boolean(error)} disabled={isSubmitting} /></label>}
          {notice && <p className="signin-message signin-notice" role="status">{notice}</p>}
          {error && <p className="signin-message signin-error" role="alert">{error}</p>}
          <button className="signin-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Working…' : mode === 'demo' ? 'Continue' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}</button>
        </form>
        <p className="signin-switch">
          {mode !== 'demo' && <button type="button" onClick={() => switchMode('demo')}>Continue anonymously</button>}
          {mode === 'demo' && <><button type="button" onClick={() => switchMode('sign-in')}>Sign in</button>{' · '}<button type="button" onClick={() => switchMode('sign-up')}>Create an account</button></>}
          {mode === 'sign-in' && <><span> · </span><button type="button" onClick={() => switchMode('sign-up')}>Create an account</button></>}
          {mode === 'sign-up' && <><span> · </span><button type="button" onClick={() => switchMode('sign-in')}>Sign in</button></>}
        </p>
      </section>
    </main>
  )
}
