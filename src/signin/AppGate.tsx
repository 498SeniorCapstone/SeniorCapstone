import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import '../questionarre/styles.css'
import './styles.css'
import { AccountUpgrade } from './AccountUpgrade'
import { DemoSignin } from './DemoSignin'
import { finishAnonymousAccountUpgrade, getCurrentAuthUser, signInWithPassword, signUpWithPassword, upgradeAnonymousAccount } from './authService'
import { restoreDemoProfile, selectDemoProfile, syncOwnedProfileIdentity } from './profileService'
import type { DemoProfile } from './profileService'
import type { AccountUpgradeResult, AuthFlowResult, SignInValues, SignUpValues } from './types'
import { Questionnaire, submitDemoPreferences } from '../questionarre'
import type { MealPreferences } from '../questionarre'
import { supabase, supabaseConfigurationError } from '../lib/supabase'

function demoDraftScope(profileId: number) {
  return `demo-profile:${profileId}`
}

type RestoreState = 'loading' | 'ready' | 'error'

export function AppGate() {
  const [demoProfile, setDemoProfile] = useState<DemoProfile | null>(null)
  const [isQuestionnaireComplete, setIsQuestionnaireComplete] = useState(false)
  const [restoreState, setRestoreState] = useState<RestoreState>('loading')
  const [restoreError, setRestoreError] = useState('')
  const restoreRequest = useRef(0)
  const activeAuthUserId = useRef<string | null>(null)

  const applyProfile = useCallback((profile: DemoProfile | null) => {
    setDemoProfile(profile)
    activeAuthUserId.current = profile?.auth_user_id ?? null
    setIsQuestionnaireComplete(profile?.questionnare_completed === true)
    setRestoreError('')
    setRestoreState('ready')
  }, [])

  const restore = useCallback(async () => {
    const requestId = ++restoreRequest.current
    setRestoreState('loading')
    setRestoreError('')
    try {
      const profile = await restoreDemoProfile()
      if (requestId !== restoreRequest.current) return
      applyProfile(profile)
    } catch (error) {
      if (requestId !== restoreRequest.current) return
      setDemoProfile(null)
      activeAuthUserId.current = null
      setIsQuestionnaireComplete(false)
      setRestoreError(error instanceof Error ? error.message : supabaseConfigurationError)
      setRestoreState('error')
    }
  }, [applyProfile])

  useEffect(() => {
    queueMicrotask(() => void restore())
  }, [restore])

  useEffect(() => {
    if (!supabase) return
    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        restoreRequest.current += 1
        activeAuthUserId.current = null
        setDemoProfile(null)
        setIsQuestionnaireComplete(false)
        setRestoreError('')
        setRestoreState('ready')
      } else if (activeAuthUserId.current && session.user.id !== activeAuthUserId.current) {
        void restore()
      }
    })
    return () => authSubscription.subscription.unsubscribe()
  }, [restore])

  const beginDemo = async (displayName: string) => {
    const profile = await selectDemoProfile(displayName)
    restoreRequest.current += 1
    applyProfile(profile)
  }

  const completeAuthenticatedProfile = async (displayName: string): Promise<AuthFlowResult> => {
    const profile = await selectDemoProfile(displayName)
    await syncOwnedProfileIdentity()
    restoreRequest.current += 1
    applyProfile(profile)
    return 'ready'
  }

  const handleSignIn = async (values: SignInValues): Promise<AuthFlowResult> => {
    const user = await signInWithPassword(values)
    const profile = await restoreDemoProfile()
    if (profile) {
      await syncOwnedProfileIdentity()
      restoreRequest.current += 1
      applyProfile(profile)
      return 'ready'
    }
    const metadataName = typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : ''
    if (metadataName) return completeAuthenticatedProfile(metadataName)
    return 'profile-setup'
  }

  const handleSignUp = async (values: SignUpValues): Promise<AuthFlowResult> => {
    const currentUser = await getCurrentAuthUser()
    if (currentUser?.is_anonymous) {
      const upgradeResult = await upgradeAnonymousAccount(values.email, values.password)
      if (upgradeResult === 'confirmation-required') return 'confirmation-required'
      return completeAuthenticatedProfile(values.username)
    }
    if (currentUser) return completeAuthenticatedProfile(values.username)

    const response = await signUpWithPassword(values)
    if (!response.session) return 'confirmation-required'
    return completeAuthenticatedProfile(values.username)
  }

  const requestAccountUpgrade = async (email: string, password: string): Promise<AccountUpgradeResult> => {
    const result = await upgradeAnonymousAccount(email, password)
    if (result === 'complete') {
      const profile = await restoreDemoProfile()
      if (profile) {
        await syncOwnedProfileIdentity()
        restoreRequest.current += 1
        applyProfile(profile)
      }
    }
    return result
  }

  const finishAccountUpgrade = async (password: string) => {
    await finishAnonymousAccountUpgrade(password)
    await syncOwnedProfileIdentity()
    const profile = await restoreDemoProfile()
    if (profile) {
      restoreRequest.current += 1
      applyProfile(profile)
    }
  }

  const completeDemoQuestionnaire = async (answers: MealPreferences) => {
    if (!demoProfile) throw new Error('No demo profile is selected.')
    await submitDemoPreferences(demoProfile.id, answers)
    setIsQuestionnaireComplete(true)
  }

  if (restoreState === 'loading') return <StatusScreen title="Restoring your demo profile…" />
  if (restoreState === 'error') {
    return <StatusScreen title="We could not restore your demo profile." detail={restoreError} action={<button type="button" onClick={() => void restore()}>Retry</button>} />
  }
  if (!demoProfile) return <DemoSignin onContinue={beginDemo} onSignIn={handleSignIn} onSignUp={handleSignUp} />

  return <>
    {!isQuestionnaireComplete && <><AccountUpgradePanel profile={demoProfile} onRequest={requestAccountUpgrade} onFinish={finishAccountUpgrade} /><Questionnaire key={demoProfile.id} draftScope={demoDraftScope(demoProfile.id)} onComplete={completeDemoQuestionnaire} /></>}
    {isQuestionnaireComplete && <Outlet />}
  </>
}

function AccountUpgradePanel({ profile, onRequest, onFinish }: { profile: DemoProfile; onRequest: (email: string, password: string) => Promise<AccountUpgradeResult>; onFinish: (password: string) => Promise<void> }) {
  if (!profile.is_anonymous && !profile.upgrade_pending) return null
  return <AccountUpgrade onRequest={onRequest} onFinish={onFinish} />
}

function StatusScreen({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <main className="status-screen"><h1>{title}</h1>{detail && <p>{detail}</p>}{action}</main>
}
