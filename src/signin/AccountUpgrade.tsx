import { useState } from 'react'
import type { AccountUpgradeResult } from './types'
import { validateEmail, validatePassword, validatePasswordConfirmation } from './validation'

interface AccountUpgradeProps {
  onRequest: (email: string, password: string) => Promise<AccountUpgradeResult>
  onFinish: (password: string) => Promise<void>
}

export function AccountUpgrade({ onRequest, onFinish }: AccountUpgradeProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    const validationError = validateEmail(email) || validatePassword(password) || validatePasswordConfirmation(password, confirmation)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const result = await onRequest(email, password)
      if (result === 'confirmation-required') {
        setNeedsConfirmation(true)
        setMessage('Check your email, confirm the address, then return here to finish saving your password.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const finish = async () => {
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)
    try {
      await onFinish(password)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not finish saving your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="account-upgrade" aria-labelledby="account-upgrade-title">
      <h2 id="account-upgrade-title">Save your account</h2>
      <p>Connect an email and password to keep this profile after clearing browser storage or changing devices.</p>
      <form onSubmit={submit} noValidate>
        <label className="signin-field" htmlFor="upgrade-email"><span>Email</span><input id="upgrade-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" disabled={isSubmitting || needsConfirmation} /></label>
        <label className="signin-field" htmlFor="upgrade-password"><span>Password</span><input id="upgrade-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" disabled={isSubmitting} /></label>
        <label className="signin-field" htmlFor="upgrade-confirm-password"><span>Confirm password</span><input id="upgrade-confirm-password" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password" disabled={isSubmitting} /></label>
        {message && <p className="signin-message signin-notice" role="status">{message}</p>}
        {error && <p className="signin-message signin-error" role="alert">{error}</p>}
        {!needsConfirmation && <button className="signin-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save your account'}</button>}
        {needsConfirmation && <button className="signin-submit" type="button" onClick={() => void finish()} disabled={isSubmitting}>{isSubmitting ? 'Finishing…' : 'I confirmed my email'}</button>}
      </form>
    </section>
  )
}
